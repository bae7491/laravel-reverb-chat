<?php
  namespace App\Http\Controllers;

  use Spatie\MediaLibrary\MediaCollections\Models\Media;
  use Illuminate\Support\Facades\Response;

  class MediaController extends Controller
  {
      public function download(Media $media)
      {
          // 파일 다운로드 처리
          if (!$media) {
              return abort(404, 'File not found.');
          }

          // 파일 경로 및 다운로드 처리
          return Response::download($media->getPath(), $media->file_name);
      }
  }
