/* Netlify Function: ai-meeting-prep
 * Receives { event, customerData } in POST body and returns { summary }
 */
import fetch from 'node-fetch';

function formatCustomerForPrompt(customer) {
  if (!customer) return 'No customer data available.';
  // Adjust fields as needed based on your schema
  return [
    `- Name: ${customer.name || customer.full_name || ''}`,
    customer.company ? `- Company: ${customer.company}` : '',
    customer.email ? `- Email: ${customer.email}` : '',
    customer.phone ? `- Phone: ${customer.phone}` : '',
    customer.address ? `- Address: ${customer.address}` : '',
    customer.notes ? `- Notes: ${customer.notes}` : ''
  ].filter(Boolean).join('\n');
}

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  try {
    const { event: meeting, customerData } = JSON.parse(event.body || '{}');

    if (!process.env.OPENROUTER_API_KEY) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'OPENROUTER_API_KEY not set' }),
      };
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'mistralai/mistral-7b-instruct', // ücretsiz ve hızlı bir model, istersen başka bir model seçebilirsin
        messages: [
          {
            role: 'system',
            content:
              "You are a smart CRM assistant. Given an upcoming customer meeting, generate a concise briefing including 1) customer summary, 2) key talking points, 3) location notes or potential issues, 4) open tasks/deals/tickets to mention. Use bullet points.",
          },
          {
            role: 'user',
            content: `Meeting Information:\n- Title: ${meeting?.title}\n- Time: ${meeting?.start}\n- Location: ${meeting?.location || meeting?.extendedProps?.location || 'N/A'}\n\nCustomer Information:\n${customerData ? formatCustomerForPrompt(customerData) : 'No customer data available.'}`,
          },
        ],
        temperature: 0.4,
        max_tokens: 400,
      }),
    });

    const json = await response.json();

    if (!response.ok) {
      console.error('OpenAI error', json);
      return {
        statusCode: 502,
        body: JSON.stringify({ error: 'OpenAI request failed', details: json }),
      };
    }

    const summary = json.choices?.[0]?.message?.content || '';
    return {
      statusCode: 200,
      body: JSON.stringify({ summary }),
    };
  } catch (err) {
    console.error('Function error', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};
