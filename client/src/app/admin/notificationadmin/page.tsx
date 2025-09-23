import Link from 'next/link';
import { getAllContacts } from '../../../actions/admin-contacts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export const dynamic = 'force-dynamic';

export default async function Notification() {
  const messages = await getAllContacts();

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-foreground">Notifications</h1>
          <Button asChild variant="secondary">
            <Link href="/admin/home">Back to Home</Link>
          </Button>
        </div>

        <Card className="border-border">
          <CardHeader>
            <CardTitle>Seller Messages</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[220px]">Seller Email</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead className="w-[140px]">Status</TableHead>
                  <TableHead className="w-[180px] text-right">Received</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {messages.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      No messages yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  messages.map((m) => (
                    <TableRow key={m.id}>
                      <TableCell className="font-medium">{m.sellerEmail}</TableCell>
                      <TableCell className="max-w-[520px]">
                        <p className="line-clamp-2 text-sm">{m.message}</p>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex rounded-md border px-2 py-1 text-xs capitalize">
                          {m.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right text-sm text-muted-foreground">
                        {new Date(m.createdAt as unknown as string).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button asChild>
            <Link href="/admin/home">Back</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
