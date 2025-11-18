'use client';

import { useState, useRef, ChangeEvent } from 'react';
import { Upload, X, Play, Youtube, Instagram, Facebook, Twitter, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import type { BlogVideo, VideoPlatform } from '@/lib/data/blog';

interface VideoUploadProps {
  video?: BlogVideo;
  onChange: (video: BlogVideo | undefined) => void;
}

export function VideoUpload({ video, onChange }: VideoUploadProps) {
  const [uploadType, setUploadType] = useState<'local' | 'url'>('local');
  const [videoUrl, setVideoUrl] = useState('');
  const [platform, setPlatform] = useState<VideoPlatform>('youtube');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('video/')) {
      toast.error('Please upload a valid video file');
      return;
    }

    // Validate file size (max 100MB)
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSize) {
      toast.error('Video file is too large. Maximum size is 100MB');
      return;
    }

    // Create object URL for preview
    const objectUrl = URL.createObjectURL(file);

    // Get video duration
    const videoElement = document.createElement('video');
    videoElement.src = objectUrl;
    videoElement.onloadedmetadata = () => {
      const duration = Math.floor(videoElement.duration);
      
      onChange({
        url: objectUrl,
        platform: 'local',
        fileName: file.name,
        fileSize: file.size,
        duration,
      });

      toast.success('Video uploaded successfully!');
    };
  };

  const handleUrlSubmit = () => {
    if (!videoUrl.trim()) {
      toast.error('Please enter a video URL');
      return;
    }

    let embedUrl = '';
    let detectedPlatform: VideoPlatform = platform;

    // Auto-detect platform and generate embed URL
    if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
      detectedPlatform = 'youtube';
      const videoId = extractYouTubeId(videoUrl);
      if (videoId) {
        embedUrl = `https://www.youtube.com/embed/${videoId}`;
      }
    } else if (videoUrl.includes('instagram.com')) {
      detectedPlatform = 'instagram';
      embedUrl = `${videoUrl}embed`;
    } else if (videoUrl.includes('facebook.com')) {
      detectedPlatform = 'facebook';
      embedUrl = videoUrl;
    } else if (videoUrl.includes('twitter.com') || videoUrl.includes('x.com')) {
      detectedPlatform = 'twitter';
      embedUrl = videoUrl;
    } else if (videoUrl.includes('tiktok.com')) {
      detectedPlatform = 'tiktok';
      embedUrl = videoUrl;
    }

    onChange({
      url: videoUrl,
      embedUrl: embedUrl || videoUrl,
      platform: detectedPlatform,
    });

    toast.success('Video link added successfully!');
  };

  const extractYouTubeId = (url: string): string | null => {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[7].length === 11 ? match[7] : null;
  };

  const removeVideo = () => {
    onChange(undefined);
    setVideoUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    toast.success('Video removed');
  };

  const getPlatformIcon = (platform: VideoPlatform) => {
    switch (platform) {
      case 'youtube':
        return <Youtube className="h-5 w-5 text-red-500" />;
      case 'instagram':
        return <Instagram className="h-5 w-5 text-pink-500" />;
      case 'facebook':
        return <Facebook className="h-5 w-5 text-blue-500" />;
      case 'twitter':
        return <Twitter className="h-5 w-5 text-blue-400" />;
      case 'local':
        return <Video className="h-5 w-5 text-green-500" />;
      default:
        return <Play className="h-5 w-5" />;
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      <Label>Video (Optional)</Label>

      {/* Upload Type Toggle */}
      {!video && (
        <div className="flex gap-2 mb-4">
          <Button
            type="button"
            variant={uploadType === 'local' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setUploadType('local')}
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload Video
          </Button>
          <Button
            type="button"
            variant={uploadType === 'url' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setUploadType('url')}
          >
            <Play className="h-4 w-4 mr-2" />
            Social Media Link
          </Button>
        </div>
      )}

      {/* Video Preview */}
      {video && (
        <Card className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              {getPlatformIcon(video.platform)}
              <div>
                <p className="font-medium">
                  {video.platform === 'local' ? video.fileName : 'Social Media Video'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {video.platform === 'local' && video.fileSize
                    ? formatFileSize(video.fileSize)
                    : video.platform.charAt(0).toUpperCase() + video.platform.slice(1)}
                  {video.duration && ` • ${Math.floor(video.duration / 60)}:${(video.duration % 60).toString().padStart(2, '0')}`}
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={removeVideo}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Video Preview */}
          {video.platform === 'local' && (
            <video
              src={video.url}
              controls
              className="w-full rounded-lg max-h-64"
            />
          )}
          {video.platform === 'youtube' && video.embedUrl && (
            <iframe
              src={video.embedUrl}
              className="w-full aspect-video rounded-lg"
              allowFullScreen
            />
          )}
          {video.platform !== 'local' && video.platform !== 'youtube' && (
            <div className="bg-muted rounded-lg p-8 text-center">
              <Play className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Video will be embedded from {video.platform}
              </p>
              <a
                href={video.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline"
              >
                View on {video.platform}
              </a>
            </div>
          )}
        </Card>
      )}

      {/* Upload Interface */}
      {!video && uploadType === 'local' && (
        <div
          className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-sm font-medium mb-1">Click to upload video</p>
          <p className="text-xs text-muted-foreground">MP4, WebM, or OGG (max 100MB)</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
      )}

      {/* URL Input */}
      {!video && uploadType === 'url' && (
        <div className="space-y-3">
          <div className="flex gap-2">
            <Input
              placeholder="Paste YouTube, Instagram, TikTok, Facebook, or Twitter video URL"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleUrlSubmit()}
            />
            <Button type="button" onClick={handleUrlSubmit}>
              Add
            </Button>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setPlatform('youtube')}
            >
              <Youtube className="h-4 w-4 mr-1" />
              YouTube
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setPlatform('instagram')}
            >
              <Instagram className="h-4 w-4 mr-1" />
              Instagram
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setPlatform('facebook')}
            >
              <Facebook className="h-4 w-4 mr-1" />
              Facebook
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setPlatform('twitter')}
            >
              <Twitter className="h-4 w-4 mr-1" />
              Twitter
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
