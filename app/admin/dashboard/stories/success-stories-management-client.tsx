'use client'

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useLocale } from '@/lib/locale-context';
import toast from 'react-hot-toast';
import { uploadToCloudinary } from '@/lib/cloudinary-upload';

interface SuccessStory {
  id: string;
  author: string;
  story: string;
  imageUrl?: string;
  date: string;
  sellerId?: string;
}

export default function SuccessStoriesManagementClient() {
  const { user, getAuthToken } = useAuth();
  const router = useRouter();
  const { t } = useLocale();
  const [stories, setStories] = useState<SuccessStory[]>([]);
  const [sellers, setSellers] = useState<{id: string, name: string}[]>([]); // Add sellers state
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentStory, setCurrentStory] = useState<SuccessStory | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const fetchSellers = useCallback(async () => {
    try {
      const token = await getAuthToken();
      if (!token) {
        throw new Error('No authentication token available');
      }

      const response = await fetch('/api/admin/sellers', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || `Failed to fetch sellers: ${response.status} ${response.statusText}`;
        throw new Error(errorMessage);
      }

      const sellersData = await response.json();
      // Filter only approved sellers
      const approvedSellers = sellersData
        .filter((seller: { status: string }) => seller.status === 'approved')
        .map((seller: { id: string; name: string }) => ({ id: seller.id, name: seller.name }));
      setSellers(approvedSellers);
    } catch (error: unknown) {
      console.error('Error fetching sellers:', error);
    }
  }, [getAuthToken]);

  const fetchStories = useCallback(async () => {
    try {
      const token = await getAuthToken();
      if (!token) {
        throw new Error('No authentication token available');
      }

      const response = await fetch('/api/admin/stories', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || `Failed to fetch stories: ${response.status} ${response.statusText}`;
        throw new Error(errorMessage);
      }

      const storiesData = await response.json();
      setStories(storiesData as SuccessStory[]);
    } catch (error: unknown) {
      console.error('Error fetching stories:', error);
      // Provide a more specific error message to the user
      const errorMessage = (error as Error).message || t('admin.stories.fetchFailed');
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [getAuthToken, t]);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      router.push('/login');
      return;
    }
    
    fetchStories();
    fetchSellers(); // Fetch sellers when component mounts
  }, [user, router, fetchStories, fetchSellers]);

  const handleCreateNew = () => {
    setCurrentStory({
      id: '',
      author: '',
      story: '',
      date: new Date().toISOString(),
      sellerId: undefined,
    });
    setImageFile(null);
    setImagePreview(null);
    setIsEditing(true);
  };

  const handleEdit = (story: SuccessStory) => {
    setCurrentStory(story);
    setImageFile(null);
    setImagePreview(story.imageUrl || null);
    setIsEditing(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('admin.stories.confirmDelete'))) return;
    
    try {
      const token = await getAuthToken();
      if (!token) {
        throw new Error('No authentication token available');
      }

      const response = await fetch(`/api/admin/stories?id=${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || `Failed to delete story: ${response.status} ${response.statusText}`;
        throw new Error(errorMessage);
      }

      toast.success(t('admin.stories.deleteSuccess'));
      fetchStories();
    } catch (error: unknown) {
      console.error('Error deleting story:', error);
      const errorMessage = (error as Error).message || t('admin.stories.deleteFailed');
      toast.error(errorMessage);
    }
  };

  const handleSave = async () => {
    if (!currentStory) return;
    
    try {
      const token = await getAuthToken();
      if (!token) {
        throw new Error('No authentication token available');
      }

      let imageUrl = currentStory.imageUrl;
      
      // Upload image if a new one was selected
      if (imageFile) {
        const uploadedUrl = await uploadToCloudinary(imageFile);
        imageUrl = uploadedUrl;
      }

      const storyData = {
        ...currentStory,
        imageUrl,
        sellerId: currentStory.sellerId,
      };

      const method = currentStory.id ? 'PUT' : 'POST';
      const url = currentStory.id ? `/api/admin/stories?id=${currentStory.id}` : '/api/admin/stories';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(storyData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || `Failed to save story: ${response.status} ${response.statusText}`;
        throw new Error(errorMessage);
      }

      toast.success(t('admin.stories.saveSuccess'));
      setIsEditing(false);
      fetchStories();
    } catch (error: unknown) {
      console.error('Error saving story:', error);
      const errorMessage = (error as Error).message || t('admin.stories.saveFailed');
      toast.error(errorMessage);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setCurrentStory(null);
    setImageFile(null);
    setImagePreview(null);
  };

  if (isLoading) {
    return <div>{t('common.loading')}</div>;
  }

  if (!user || user.role !== 'admin') {
    return <div>{t('common.unauthorized')}</div>;
  }

  // Test translation
  const testTitle = t('admin.stories.title');
  console.log('Test title:', testTitle);
  
  if (isEditing && currentStory) {
    return (
      <div className="container mx-auto py-10">
        <Card>
          <CardHeader>
            <CardTitle>
              {currentStory.id ? t('admin.stories.editStory') : t('admin.stories.addStory')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="author">{t('admin.stories.author')}</label>
              <Input
                id="author"
                value={currentStory.author}
                onChange={(e) => setCurrentStory({...currentStory, author: e.target.value})}
                placeholder={t('admin.stories.authorPlaceholder')}
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="story">{t('admin.stories.story')}</label>
              <Textarea
                id="story"
                value={currentStory.story}
                onChange={(e) => setCurrentStory({...currentStory, story: e.target.value})}
                placeholder={t('admin.stories.storyPlaceholder')}
                rows={6}
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="seller">{t('admin.sellers')}</label>
              <select
                id="seller"
                value={currentStory.sellerId || ''}
                onChange={(e) => setCurrentStory({...currentStory, sellerId: e.target.value || undefined})}
                className="w-full p-2 border rounded-md"
              >
                <option value="">{t('admin.stories.selectSeller')}</option>
                {sellers.map((seller) => (
                  <option key={seller.id} value={seller.id}>
                    {seller.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="image">{t('admin.stories.image')}</label>
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
              {imagePreview && (
                <div className="mt-2 relative h-40 w-40">
                  <Image 
                    src={imagePreview} 
                    alt="Preview" 
                    fill
                    className="rounded object-cover"
                  />
                </div>
              )}
            </div>
            
            <div className="flex gap-2">
              <Button onClick={handleSave}>{t('common.save')}</Button>
              <Button variant="outline" onClick={handleCancel}>{t('common.cancel')}</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{t('admin.stories.title')}</h1>
        <Button onClick={handleCreateNew}>{t('admin.stories.addNew')}</Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>{t('admin.stories.list')}</CardTitle>
          <CardDescription>{t('admin.stories.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          {stories.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">{t('admin.stories.noStories')}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('admin.stories.author')}</TableHead>
                  <TableHead>{t('admin.stories.story')}</TableHead>
                  <TableHead>{t('admin.stories.date')}</TableHead>
                  <TableHead>{t('admin.stories.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stories.map((story) => (
                  <TableRow key={story.id}>
                    <TableCell>{story.author}</TableCell>
                    <TableCell className="max-w-xs truncate">{story.story}</TableCell>
                    <TableCell>{new Date(story.date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(story)}>
                          {t('common.edit')}
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDelete(story.id)}>
                          {t('common.delete')}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
