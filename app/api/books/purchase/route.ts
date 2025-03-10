import { getUsersByQuery, updateUser } from "@/lib/mongo/users";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { userId, price, bookId } = await req.json();

    if (!userId || !bookId || typeof price !== "number" || price <= 0) {
      return NextResponse.json(
        { error: "Invalid input parameters" },
        { status: 400 }
      );
    }

    const { users, error: userError } = await getUsersByQuery({ _id: userId });

    if (userError || !users?.length) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const user = users[0];
    const updatedCoins = user.coins - price;
    const updatedPurchasedBooks = [...user.purchasedBooks, bookId];

    const { success, error } = await updateUser(userId, { coins: updatedCoins, purchasedBooks: updatedPurchasedBooks });

    if (!success || error) {
      return NextResponse.json(
        { error: error || "Failed to update user data" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, coins: updatedCoins });
  } catch (error) {
    console.error("Unexpected server error:", error);
    return NextResponse.json(
      { error: "Failed to add coins" },
      { status: 500 }
    );
  }
}
