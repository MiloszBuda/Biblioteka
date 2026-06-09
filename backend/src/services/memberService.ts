import { db } from "../db/database";
import { MemberUpdateData } from "../db/types";

export async function getAllActiveMembers() {
  const result = await db
    .selectFrom("members")
    .selectAll()
    .where("is_active", "=", true)
    .execute();
  return result;
}

export async function createNewMember(
  firstName: string,
  lastName: string,
  address: string | null,
  cardNumber: string,
) {
  const newMember = await db
    .insertInto("members")
    .values({
      first_name: firstName,
      last_name: lastName,
      address,
      card_number: cardNumber,
    })
    .returningAll()
    .executeTakeFirstOrThrow();

  return newMember;
}

export async function updateMemberDetails(
  memberId: number,
  data: MemberUpdateData,
) {
  if (Object.keys(data).length === 0) {
    throw new Error("Nie podano danych do aktualizacji.");
  }

  const updatedMember = await db
    .updateTable("members")
    .set(data)
    .where("id", "=", memberId)
    .returningAll()
    .executeTakeFirstOrThrow();

  return updatedMember;
}

export async function deactivateMember(memberId: number) {
  return await db.transaction().execute(async (trx) => {
    const member = await trx
      .selectFrom("members")
      .selectAll()
      .where("id", "=", memberId)
      .forUpdate()
      .executeTakeFirstOrThrow();

    if (!member.is_active) {
      throw new Error("Członek jest już dezaktywowany.");
    }

    const activeBorrowings = await trx
      .selectFrom("borrowings")
      .selectAll()
      .where("member_id", "=", memberId)
      .where("return_date", "is", null)
      .execute();

    if (activeBorrowings.length > 0) {
      throw new Error(
        "Nie można dezaktywować członka, który ma aktywne wypożyczenia.",
      );
    }

    await trx
      .updateTable("members")
      .set({
        is_active: false,
        first_name: "[DEAKTYWOWANY]",
        last_name: "[DEAKTYWOWANY]",
        address: null,
        card_number: `DELETED_${memberId}_${Date.now()}`,
      })
      .where("id", "=", memberId)
      .returningAll()
      .executeTakeFirstOrThrow();

    return { message: "Członek został dezaktywowany." };
  });
}
