import { Generated, ColumnType } from "kysely";

export interface Database {
  members: MemberTable;
  books: BookTable;
  borrowings: BorrowingTable;
}

export interface MemberTable {
  id: Generated<number>;
  first_name: string;
  last_name: string;
  address: string | null;
  card_number: string;
  created_at: ColumnType<Date, string | undefined, never>;
  is_active: Generated<boolean>;
}

export interface MemberUpdateData {
  first_name?: string;
  last_name?: string;
  address?: string | null;
}

export interface BookTable {
  id: Generated<number>;
  title: string;
  author: string;
  total_copies: Generated<number>;
  available_copies: Generated<number>;
  withdrawn: Generated<boolean>;
}

export interface UpdateBookData {
  title?: string;
  author?: string;
}

export interface BorrowingTable {
  id: Generated<number>;
  member_id: number;
  book_id: number;
  borrow_date: ColumnType<Date, string | undefined, never>;
  due_date: Date;
  return_date: Date | null;
}
