import { NextRequest, NextResponse } from "next/server";
import { getUsersByQuery, updateUser } from "@/lib/mongo/users";

export async function POST(req: NextRequest) {
  try {
    const { userId, coins } = await req.json();

    console.log("Received Coin Addition Request:", { userId, coins });

    if (!userId || typeof coins !== "number" || coins <= 0) {
      return NextResponse.json({ error: "Invalid input parameters" }, { status: 400 });
    }

    // Fetch the user by ID
    const { users, error: userError } = await getUsersByQuery({ _id: userId });

    if (userError || !users?.length) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const user = users[0];

    // Update user's coin balance
    const updatedCoins = (user.coins || 0) + coins;
    const { success, error } = await updateUser(userId, { coins: updatedCoins });

    if (!success || error) {
      return NextResponse.json({ error: "Failed to update user balance" }, { status: 500 });
    }

    console.log("Coins successfully added:", { userId, updatedCoins });

    return NextResponse.json({ success: true, updatedCoins });
  } catch (error) {
    console.error("Unexpected server error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
