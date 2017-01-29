//
//  MyCustomView.m
//  ArtsBuzzReact
//
//  Created by ZhongTingliang on 11/16/16.
//  Copyright © 2016 Facebook. All rights reserved.
//

#import "MyCustomView.h"

@implementation MyCustomView
{

}

//指定宽度按比例缩放
-(UIImage *) imageCompressForWidthScale:(UIImage *)sourceImage targetWidth:(CGFloat)defineWidth{
  
  UIImage *newImage = nil;
  CGSize imageSize = sourceImage.size;
  CGFloat width = imageSize.width;
  CGFloat height = imageSize.height;
  CGFloat targetWidth = defineWidth;
  CGFloat targetHeight = height / (width / targetWidth);
  CGSize size = CGSizeMake(targetWidth, targetHeight);
  CGFloat scaleFactor = 0.0;
  CGFloat scaledWidth = targetWidth;
  CGFloat scaledHeight = targetHeight;
  CGPoint thumbnailPoint = CGPointMake(0.0, 0.0);
  
  if(CGSizeEqualToSize(imageSize, size) == NO){
    
    CGFloat widthFactor = targetWidth / width;
    CGFloat heightFactor = targetHeight / height;
    
    if(widthFactor > heightFactor){
      scaleFactor = widthFactor;
    }
    else{
      scaleFactor = heightFactor;
    }
    scaledWidth = width * scaleFactor;
    scaledHeight = height * scaleFactor;
    
    if(widthFactor > heightFactor){
      
      thumbnailPoint.y = (targetHeight - scaledHeight) * 0.5;
      
    }else if(widthFactor < heightFactor){
      
      thumbnailPoint.x = (targetWidth - scaledWidth) * 0.5;
    }
  }
  
  UIGraphicsBeginImageContext(size);
  
  CGRect thumbnailRect = CGRectZero;
  thumbnailRect.origin = thumbnailPoint;
  thumbnailRect.size.width = scaledWidth;
  thumbnailRect.size.height = scaledHeight;
  
  [sourceImage drawInRect:thumbnailRect];
  
  newImage = UIGraphicsGetImageFromCurrentImageContext();
  
  if(newImage == nil){
    
    NSLog(@"scale image fail");
  }
  UIGraphicsEndImageContext();
  return newImage;
}

- (void)setTextHeight:(NSInteger)textHeight
{
  _textHeight = textHeight;
}

- (void)setTextFontSize:(NSInteger)textFontSize
{
  _textFontSize = textFontSize;
}

-(void)setTextFontFamily:(NSString *)textFontFamily
{
  _textFontFamily = textFontFamily;
}

-(void)setTextContent:(NSString *)textContent
{
  _textContent = textContent;
}

- (void)setCropImageHeight:(NSInteger)cropImageHeight
{
  _cropImageHeight = cropImageHeight;
}

- (void)setCropImageWidth:(NSInteger)cropImageWidth
{
  _cropImageWidth = cropImageWidth;
}

- (void)setSrcImagePath:(NSString *)srcImagePath
{
  _srcImagePath = srcImagePath;
  [self setNeedsDisplay];
}

- (void)drawRect:(CGRect)rect
{
  UIImage *srcImage = [UIImage imageWithContentsOfFile:_srcImagePath];
  UIImage *scaleImage = [self imageCompressForWidthScale:srcImage targetWidth:_cropImageWidth];
  CGImageRef cgRef = scaleImage.CGImage;
  CGFloat srcWidth = CGImageGetWidth(cgRef);
  CGFloat srcHeight = CGImageGetHeight(cgRef);
  CGImageRef imageRef = CGImageCreateWithImageInRect(cgRef,CGRectMake(
                                                                      srcWidth / 2 - _cropImageWidth / 2,
                                                                      srcHeight / 2 - _cropImageHeight / 2,
                                                                      srcWidth / 2 + _cropImageWidth / 2,
                                                                      srcHeight / 2 + _cropImageHeight / 2));
  UIImage *cropImage = [UIImage imageWithCGImage:imageRef];
  CGImageRelease(imageRef);

  UIImageView  *imageView = [[UIImageView alloc] init];
  imageView.frame = CGRectMake(0, 0, _cropImageWidth, _cropImageHeight);
  [imageView setImage:cropImage];

  [self addSubview:imageView];

  UILabel *textView = [[UILabel alloc]
                          initWithFrame:CGRectMake(0, _cropImageHeight - _textHeight, _cropImageWidth, _textHeight)];
  [textView setBackgroundColor:[UIColor blackColor]];
  [textView setTextColor:[UIColor whiteColor]];
  [textView setAlpha:0.5f];
  [textView setFont:[UIFont fontWithName:_textFontFamily size:_textFontSize]];
  [textView setText:_textContent];

  [self addSubview:textView];
  
  CGContextFillRect(UIGraphicsGetCurrentContext(), rect);
}
@end
