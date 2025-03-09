import { NextResponse } from "next/server";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_INITIALIZE_URL = "https://api.paystack.co/transaction/initialize";

interface Item {
  name: string;
  price: number;
  quantity?: number;
}

interface RequestBody {
  email: string;
  items: Item[];
}

export async function POST(req: Request) {
  try {
    const body: RequestBody = await req.json();

    if (!body.items || !Array.isArray(body.items) || body.items.length === 0 || !body.email) {
      return NextResponse.json({ error: "Invalid request data" }, { status: 400 });
    }

    // Calculate total amount in kobo
    const totalAmount = body.items.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0) * 100;

    const response = await fetch(PAYSTACK_INITIALIZE_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: body.email,
        amount: totalAmount,
        currency: "NGN",
        callback_url: `${process.env.NEXT_PUBLIC_DOMAIN}/success`,
      }),
    });

    const paystackResponse = await response.json();

    if (!paystackResponse.status) {
      throw new Error(paystackResponse.message || "Failed to initialize payment");
    }

    return NextResponse.json({ success: true, authorizationUrl: paystackResponse.data.authorization_url });
  } catch (error) {
    console.error("Payment error:", (error as Error).message);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
