//
//  MyCustomView.h
//  ArtsBuzzReact
//
//  Created by ZhongTingliang on 11/16/16.
//  Copyright © 2016 Facebook. All rights reserved.
//

#import <UIKit/UIKit.h>

@interface MyCustomView : UIView
@property (nonatomic) NSString* srcImagePath;
@property (nonatomic) NSInteger cropImageWidth;
@property (nonatomic) NSInteger cropImageHeight;
@property (nonatomic) NSInteger textHeight;
@property (nonatomic) NSInteger textFontSize;
@property (nonatomic) NSString* textFontFamily;
@property (nonatomic) NSString* textContent;
-(UIImage *) imageCompressForWidthScale:(UIImage *)sourceImage targetWidth:(CGFloat)defineWidth;
@end
