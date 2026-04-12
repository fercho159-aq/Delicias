import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';

const client = new MercadoPagoConfig({
    accessToken: process.env.MP_ACCESS_TOKEN!,
});

export const preference = new Preference(client);
export const payment = new Payment(client);

const MP_API_BASE = 'https://api.mercadopago.com';

export async function createMPSubscription(payload: {
    reason: string;
    external_reference: string;
    payer_email: string;
    auto_recurring: {
        frequency: number;
        frequency_type: string;
        transaction_amount: number;
        currency_id: string;
    };
    back_url: string;
    status: string;
}) {
    const res = await fetch(`${MP_API_BASE}/preapproval`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
        },
        body: JSON.stringify(payload),
    });

    if (!res.ok) {
        const error = await res.text();
        throw new Error(`MP preapproval creation failed (${res.status}): ${error}`);
    }

    return res.json();
}

export async function getMPSubscription(id: string) {
    const res = await fetch(`${MP_API_BASE}/preapproval/${id}`, {
        headers: {
            Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
        },
    });

    if (!res.ok) {
        const error = await res.text();
        throw new Error(`MP preapproval fetch failed (${res.status}): ${error}`);
    }

    return res.json();
}
