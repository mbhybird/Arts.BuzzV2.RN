//
//  MyCustomViewManager.m
//  ArtsBuzzReact
//
//  Created by ZhongTingliang on 5/17/16.
//  Copyright © 2016 Facebook. All rights reserved.
//

#import "MyCustomViewManager.h"
#import "MyCustomView.h"

@implementation MyCustomViewManager

RCT_EXPORT_MODULE()

- (UIView *)view
{
  MyCustomView * theView;
  theView = [[MyCustomView alloc] initWithFrame:CGRectMake(0,0,10,10)];
  return theView;
}

RCT_EXPORT_VIEW_PROPERTY(srcImagePath, NSString);
RCT_EXPORT_VIEW_PROPERTY(cropImageWidth, NSInteger);
RCT_EXPORT_VIEW_PROPERTY(cropImageHeight, NSInteger);
RCT_EXPORT_VIEW_PROPERTY(textHeight, NSInteger);
RCT_EXPORT_VIEW_PROPERTY(textFontSize, NSInteger);
RCT_EXPORT_VIEW_PROPERTY(textFontFamily, NSString);
RCT_EXPORT_VIEW_PROPERTY(textContent, NSString);
@end
