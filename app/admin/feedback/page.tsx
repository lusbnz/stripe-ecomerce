'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2 } from 'lucide-react';
import moment from 'moment';

interface Feedback {
  id: string;
  content: string;
  user_id: number;
  created_at: string;
  users: {
    id: number;
    name: string;
    email: string;
  };
}

export default function FeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    search: '',
    startDate: '',
    endDate: '',
  });

  function fetchFeedbacks() {
    setIsLoading(true);
    fetch('/api/feedback')
      .then((res) => res.json())
      .then((data) => {
        setFeedbacks(data.data || []);
      })
      .catch((error) => {
        console.error('Error fetching feedbacks:', error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const filteredFeedbacks = feedbacks?.filter((feedback) => {
    const contentMatch = feedback.content
      .toLowerCase()
      .includes(filters.search.toLowerCase());
    const emailMatch = feedback.users.email
      .toLowerCase()
      .includes(filters.search.toLowerCase());
    const startDateMatch =
      filters.startDate === '' ||
      new Date(feedback.created_at) >= new Date(filters.startDate);
    const endDateMatch =
      filters.endDate === '' ||
      new Date(feedback.created_at) <= new Date(filters.endDate);
    return (contentMatch || emailMatch) && startDateMatch && endDateMatch;
  });

  function handleDelete(feedbackId: string) {
    setIsDeleting(feedbackId);
    fetch(`/api/feedback?id=${feedbackId}`, {
      method: 'DELETE',
    })
      .then(() => {
        setFeedbacks((prev) => prev.filter((f) => f.id !== feedbackId));
      })
      .catch((error) => {
        console.error('Error deleting feedback:', error);
      })
      .finally(() => {
        setIsDeleting(null);
      });
  }

  return (
    <div>
      <div className="flex flex-wrap justify-between mb-4 gap-2">
        <div className="flex flex-wrap gap-2">
          <Input
            className="w-full sm:w-[200px]"
            placeholder="Search content or email..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
          <Input
            className="w-full sm:w-[150px]"
            type="date"
            placeholder="Start Date"
            value={filters.startDate}
            onChange={(e) =>
              setFilters({ ...filters, startDate: e.target.value })
            }
          />
          <Input
            className="w-full sm:w-[150px]"
            type="date"
            placeholder="End Date"
            value={filters.endDate}
            onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
          />
          <Button
            variant="outline"
            className="w-full sm:w-auto"
            onClick={() =>
              setFilters({
                search: '',
                startDate: '',
                endDate: '',
              })
            }
          >
            Reset
          </Button>
        </div>
        <div className="flex gap-4">
          <Button size="sm" onClick={fetchFeedbacks} disabled={isLoading}>
            Reload
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto rounded border border-gray-300">
        <Table className="text-sm">
          <TableHeader className="bg-gray-200">
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Content</TableHead>
              <TableHead>User Name</TableHead>
              <TableHead>User Email</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array(5)
                .fill(0)
                .map((_, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Skeleton className="h-4 w-12" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-48" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-32" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-32" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-8 w-32" />
                    </TableCell>
                  </TableRow>
                ))
            ) : filteredFeedbacks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  No feedback found.
                </TableCell>
              </TableRow>
            ) : (
              filteredFeedbacks.map((feedback) => (
                <TableRow key={feedback.id} className="align-middle">
                  <TableCell>{feedback.id}</TableCell>
                  <TableCell
                    dangerouslySetInnerHTML={{
                      __html:
                        feedback.content.length > 60
                          ? feedback.content.slice(0, 60) + '...'
                          : feedback.content,
                    }}
                  />
                  <TableCell>{feedback.users.name}</TableCell>
                  <TableCell>{feedback.users.email}</TableCell>
                  <TableCell>
                    {moment(feedback.created_at).format('DD/MM/YYYY HH:mm')}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(feedback.id)}
                      disabled={isDeleting === feedback.id}
                    >
                      {isDeleting === feedback.id ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        </>
                      ) : (
                        'Delete'
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}