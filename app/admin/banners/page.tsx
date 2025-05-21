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
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2 } from 'lucide-react';
import moment from 'moment';

interface Banner {
  id: string;
  image_url: string;
  alt_text: string | null;
  created_at: string;
  updated_at: string;
}

function BannerModal({
  open,
  onOpenChange,
  onSave,
  initialData,
  isSaving,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: Banner) => void;
  initialData?: Banner;
  isSaving: boolean;
}) {
  const [formData, setFormData] = useState({
    id: initialData?.id || '',
    image_url: initialData?.image_url || '',
    alt_text: initialData?.alt_text || '',
  });

  useEffect(() => {
    setFormData({
      id: initialData?.id || '',
      image_url: initialData?.image_url || '',
      alt_text: initialData?.alt_text || '',
    });
  }, [initialData]);

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.image_url.trim()) return alert('Image URL is required');
    onSave(formData as Banner);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {initialData ? 'Edit Banner' : 'Add Banner'}
          </DialogTitle>
          <DialogDescription>
            {initialData
              ? 'Update banner details below.'
              : 'Enter new banner information.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="image_url">
              Image URL
            </label>
            <Input
              id="image_url"
              name="image_url"
              value={formData.image_url}
              onChange={onChange}
              placeholder="https://..."
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="alt_text">
              Alt Text
            </label>
            <Input
              id="alt_text"
              name="alt_text"
              value={formData.alt_text}
              onChange={onChange}
              placeholder="Banner description"
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                </>
              ) : initialData ? (
                'Save Changes'
              ) : (
                'Add Banner'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function BannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    search: '',
  });

  function fetchBanners() {
    setIsLoading(true);
    fetch('/api/banners')
      .then((res) => res.json())
      .then((data) => {
        setBanners(data.data || []);
      })
      .catch((error) => {
        console.error('Error fetching banners:', error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  useEffect(() => {
    fetchBanners();
  }, []);

  const filteredBanners = banners?.filter((banner) =>
    banner.alt_text
      ?.toLowerCase()
      .includes(filters.search.toLowerCase()),
  );

  function handleSave(banner: Banner) {
    setIsSaving(true);
    const isNew = !banner.id;

    const payload = isNew ? { ...banner, id: undefined } : banner;

    fetch(isNew ? '/api/banners' : `/api/banners`, {
      method: isNew ? 'POST' : 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then((res) => res.json())
      .then((savedBanner) => {
        setBanners((prev) => {
          if (isNew) {
            return [...prev, savedBanner.data];
          } else {
            return prev.map((b) =>
              b.id === savedBanner.data.id ? savedBanner.data : b,
            );
          }
        });
        setModalOpen(false);
      })
      .catch((error) => {
        console.error('Error saving banner:', error);
      })
      .finally(() => {
        setIsSaving(false);
      });
  }

  function openAddModal() {
    setEditingBanner(null);
    setModalOpen(true);
  }

  function openEditModal(banner: Banner) {
    setEditingBanner(banner);
    setModalOpen(true);
  }

  function handleDelete(bannerId: string) {
    setIsDeleting(bannerId);
    fetch(`/api/banners?id=${bannerId}`, {
      method: 'DELETE',
    })
      .then(() => {
        setBanners((prev) => prev.filter((b) => b.id !== bannerId));
      })
      .catch((error) => {
        console.error('Error deleting banner:', error);
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
            placeholder="Search alt text..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
          <Button
            variant="outline"
            className="w-full sm:w-auto"
            onClick={() => setFilters({ search: '' })}
          >
            Reset
          </Button>
        </div>
        <div className="flex gap-4">
          <Button size="sm" onClick={fetchBanners} disabled={isLoading}>
            Reload
          </Button>
          <Button size="sm" onClick={openAddModal} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              </>
            ) : (
              'Add Banner'
            )}
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto rounded border border-gray-300">
        <Table className="text-sm">
          <TableHeader className="bg-gray-200">
            <TableRow>
              <TableHead>Image</TableHead>
              <TableHead>Alt Text</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Updated At</TableHead>
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
                      <Skeleton className="h-8 w-8 rounded" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-32" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-8 w-32" />
                    </TableCell>
                  </TableRow>
                ))
            ) : filteredBanners.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  No banners found.
                </TableCell>
              </TableRow>
            ) : (
              filteredBanners.map((banner) => (
                <TableRow key={banner.id} className="align-middle">
                  <TableCell>
                    <Image
                      src={banner.image_url}
                      alt={banner.alt_text || 'Banner'}
                      width={32}
                      height={32}
                      className="rounded object-cover h-[32px] w-[32px]"
                    />
                  </TableCell>
                  <TableCell>{banner.alt_text || '-'}</TableCell>
                  <TableCell>
                    {moment(banner.created_at).format('DD/MM/YYYY HH:mm')}
                  </TableCell>
                  <TableCell>
                    {moment(banner.updated_at).format('DD/MM/YYYY HH:mm')}
                  </TableCell>
                  <TableCell className="space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditModal(banner)}
                      disabled={isDeleting === banner.id}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(banner.id)}
                      disabled={isDeleting === banner.id}
                    >
                      {isDeleting === banner.id ? (
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

      <BannerModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSave={handleSave}
        initialData={editingBanner || undefined}
        isSaving={isSaving}
      />
    </div>
  );
}