"use client";

import dayjs from "dayjs";
import { Loader2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Book,BookLead } from "@/features/books/types";
import { supabase } from "@/lib/supabase";

// Extended type to include the joined book data
type LeadWithBook = BookLead & {
  books: Pick<Book, "title"> | null;
};

export function LeadsTab() {
  const [leads, setLeads] = useState<LeadWithBook[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    // Fetch leads and join with books table to get the book title
    const { data, error } = await supabase
      .from("book_leads")
      .select(`
        *,
        books (
          title
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to load book sales");
      console.error(error);
    } else {
      setLeads(data as unknown as LeadWithBook[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold tracking-tight">Book Sales</h2>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : leads.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-20 text-center border rounded-lg border-dashed">
          <p className="text-muted-foreground">No book sales captured yet.</p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Purchased Book</TableHead>
              <TableHead className="text-right">Purchase Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leads.map((lead) => (
              <TableRow key={lead.id}>
                <TableCell className="font-medium">{lead.email}</TableCell>
                <TableCell>{lead.phone}</TableCell>
                <TableCell>
                  {lead.books ? lead.books.title : <span className="text-muted-foreground italic">Deleted Book</span>}
                </TableCell>
                <TableCell className="text-right text-muted-foreground text-sm">
                  {dayjs(lead.created_at).format("MMM D, YYYY h:mm A")}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
