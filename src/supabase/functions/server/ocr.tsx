import { Hono } from 'npm:hono';
import { createClient } from 'npm:@supabase/supabase-js@2.39.3';

const app = new Hono();

// Função auxiliar para converter PDF em imagem
async function convertPdfToImage(base64Pdf: string): Promise<string> {
  try {
    console.log('📄 Converting PDF to image...');
    
    // Remover prefixo data: se existir
    let pdfData = base64Pdf;
    if (base64Pdf.includes('base64,')) {
      pdfData = base64Pdf.split('base64,')[1];
    }
    
    // Usar pdf-lib para ler o PDF e pdfjs para renderizar
    // Como não temos acesso a canvas no Deno, vamos usar uma abordagem diferente:
    // Vamos usar a API do CloudConvert ou similar
    
    // ALTERNATIVA: Usar ImageMagick via command line (não disponível no Deno Deploy)
    // ALTERNATIVA 2: Aceitar apenas a primeira página como imagem já convertida
    
    // Por enquanto, vamos instruir o backend a aceitar o PDF "as is" e deixar
    // o OpenAI tentar processar, mas isso não vai funcionar.
    
    // MELHOR SOLUÇÃO: Retornar erro amigável pedindo conversão manual
    throw new Error('PDF_CONVERSION_NOT_SUPPORTED');
    
  } catch (error) {
    console.error('❌ Error converting PDF:', error);
    throw error;
  }
}

// Rota para extrair dados de nota fiscal usando OpenAI Vision
app.post('/extract-invoice', async (c) => {
  try {
    console.log('📄 OCR - Extract invoice route called');
    
    // Verificar autenticação
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      console.log('❌ No access token provided');
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user) {
      console.log('❌ Invalid access token');
      return c.json({ error: 'Unauthorized' }, 401);
    }

    console.log('✅ User authenticated:', user.email);

    // Obter dados da requisição
    const body = await c.req.json();
    const { imageBase64, mimeType } = body;

    if (!imageBase64) {
      return c.json({ error: 'Image base64 required' }, 400);
    }

    console.log('📸 Processing invoice...');
    console.log('  - MIME type:', mimeType);

    // Preparar a imagem - extrair apenas o base64 puro sem o prefixo data:
    let base64Data = imageBase64;
    if (imageBase64.includes('base64,')) {
      base64Data = imageBase64.split('base64,')[1];
    } else if (imageBase64.startsWith('data:')) {
      base64Data = imageBase64.split(',')[1];
    }

    // Detectar o tipo MIME
    let detectedMimeType = mimeType || 'image/jpeg';
    if (imageBase64.startsWith('data:')) {
      const mimeMatch = imageBase64.match(/data:([^;]+);/);
      if (mimeMatch) {
        detectedMimeType = mimeMatch[1];
      }
    }

    console.log('  - Detected MIME:', detectedMimeType);
    console.log('  - Base64 length:', base64Data.length);

    // Se for PDF, retornar erro instruindo usuário a tirar screenshot/foto
    if (detectedMimeType.includes('pdf')) {
      console.log('⚠️ PDF detected');
      return c.json({ 
        error: 'Para melhor resultado, tire uma FOTO ou SCREENSHOT da nota fiscal ao invés de enviar o PDF. Abra o PDF no computador/celular, tire um print e envie a imagem.',
        isPdf: true,
        suggestion: 'screenshot'
      }, 400);
    }

    // Verificar se é um tipo de imagem válido
    const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validImageTypes.some(type => detectedMimeType.toLowerCase().includes(type.split('/')[1]))) {
      console.log('❌ Invalid image type:', detectedMimeType);
      return c.json({ 
        error: `Formato não suportado: ${detectedMimeType}. Use PNG, JPG ou tire uma foto.`,
        invalidType: true 
      }, 400);
    }

    // Preparar a URL da imagem no formato correto para OpenAI
    const imageUrl = `data:${detectedMimeType};base64,${base64Data}`;

    // Chamar OpenAI Vision API
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      console.error('❌ OPENAI_API_KEY not configured');
      return c.json({ error: 'OpenAI API key not configured' }, 500);
    }

    console.log('🤖 Calling OpenAI Vision API...');

    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `Você é um assistente especializado em extrair dados de notas fiscais brasileiras.
Analise a imagem e extraia as seguintes informações em formato JSON:
{
  "amount": número (valor total da nota fiscal),
  "description": string (descrição dos itens/serviços),
  "supplier": string (nome do fornecedor/emissor),
  "dueDate": string (data de vencimento ou emissão no formato YYYY-MM-DD),
  "category": string (uma dessas categorias: "ADMINISTRAÇÃO", "SERVIÇOS PRELIMINARES", "SERVIÇOS GERAIS", "INFRA-ESTRUTURA", "SUPRA-ESTRUTURA", "ALVENARIA", "COBERTURAS E PROTEÇÕES", "REVESTIMENTOS, ELEMENTOS DECORATIVOS E PINTURA", "PAVIMENTAÇÃO", "INSTALAÇÕES E APARELHOS", "MÃO DE OBRA E ASSOCIADOS", "COMPLEMENTAÇÃO DA OBRA", "Material", "Mão de Obra", "Equipamento", "Outros"),
  "pixKey": string ou null (chave PIX se houver),
  "confidence": número de 0 a 1 (confiança na extração)
}

Se não conseguir identificar algum campo, coloque null. Seja preciso e extraia apenas informações visíveis na imagem.`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Extraia os dados desta nota fiscal:'
              },
              {
                type: "image_url",
                image_url: {
                  url: imageUrl
                }
              }
            ]
          }
        ],
        max_tokens: 1000,
        temperature: 0.1
      })
    });

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      console.error('❌ OpenAI API error:', errorText);
      return c.json({ error: 'Failed to process image with AI', details: errorText }, 500);
    }

    const openaiData = await openaiResponse.json();
    console.log('✅ OpenAI response received');

    const assistantMessage = openaiData.choices[0]?.message?.content;
    if (!assistantMessage) {
      return c.json({ error: 'No response from AI' }, 500);
    }

    // Extrair JSON da resposta
    let extractedData;
    try {
      // Tentar encontrar JSON no texto
      const jsonMatch = assistantMessage.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        extractedData = JSON.parse(jsonMatch[0]);
      } else {
        extractedData = JSON.parse(assistantMessage);
      }
    } catch (parseError) {
      console.error('❌ Error parsing AI response:', parseError);
      console.error('AI response was:', assistantMessage);
      return c.json({ error: 'Failed to parse AI response', details: assistantMessage }, 500);
    }

    console.log('📊 Extracted data:', extractedData);

    return c.json({
      success: true,
      data: extractedData
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    console.error('❌ Error in extract-invoice route:', error);
    return c.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : String(error) 
    }, 500);
  }
});

export default app;