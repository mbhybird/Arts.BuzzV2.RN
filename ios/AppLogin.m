#import "AppLogin.h"
#import "RCTBridge.h"
#import "RCTEventDispatcher.h"

static NSString *gAppSecret = @"";
@implementation AppLogin
RCT_EXPORT_MODULE()

@synthesize bridge = _bridge;

RCT_EXPORT_METHOD(wxLoginWithRespInfo
                  : (NSDictionary *)body callback
                  : (RCTResponseSenderBlock)callback) {
  @try {

    if (body == nil || body.count <= 0) {
      callback(@[ @"cancel" ]);
      return;
    }

    if (body[@"code"] == nil) {
      callback(@[ @"cancel" ]);
      return;
    }
    AppLogin *app = [[AppLogin alloc] init];
    NSString *codeStr = body[@"code"];
    NSString *grantStr = @"grant_type=authorization_code";
    //通过code获取access_token
    //https://api.weixin.qq.com/sns/oauth2/access_token?appid=APPID&secret=SECRET&code=CODE&grant_type=authorization_code
    NSString *tokenUrl = @"https://api.weixin.qq.com/sns/oauth2/access_token?";
    NSString *tokenUrl1 = [tokenUrl
        stringByAppendingString:[NSString stringWithFormat:@"appid=%@&",
                                                           body[@"appid"]]];
    NSString *tokenUrl2 = [tokenUrl1
        stringByAppendingString:[NSString
                                    stringWithFormat:@"secret=%@&",
                                                     [self getAppSecret]]];
    NSString *tokenUrl3 = [tokenUrl2
        stringByAppendingString:[NSString
                                    stringWithFormat:@"code=%@&", codeStr]];
    NSString *tokenUrlend = [tokenUrl3 stringByAppendingString:grantStr];
    NSLog(@"%@", tokenUrlend);
    NSURL *url = [NSURL URLWithString:tokenUrlend];

    NSData *responseData = [app webRequest:url];
    if (responseData == nil) {
      UIAlertView *av = [[UIAlertView new] initWithTitle:@"Infomation"
                                                 message:@"Login time out"
                                                delegate:nil
                                       cancelButtonTitle:@"Cancel"
                                       otherButtonTitles:nil, nil];
      [av show];
      return;
    }

    NSDictionary *dic = [NSJSONSerialization JSONObjectWithData:responseData
                                                        options:0
                                                          error:nil];
    NSLog(@"%@", [dic objectForKey:@"access_token"]);
    NSString *access_token = [dic objectForKey:@"access_token"];
    NSString *openid = [dic objectForKey:@"openid"];

    //第三步：通过access_token得到昵称、unionid等信息
    NSURL *userInfoRequestURL = [NSURL
        URLWithString:[NSString stringWithFormat:@"https://api.weixin.qq.com/"
                                                 @"sns/"
                                                 @"userinfo?access_token=%@&"
                                                 @"openid=%@",
                                                 access_token, openid]];

    NSData *responseDataUserinfo = [app webRequest:userInfoRequestURL];
    if (responseDataUserinfo == nil) {
      UIAlertView *av = [[UIAlertView new] initWithTitle:@"Infomation"
                                                 message:@"Login time out"
                                                delegate:nil
                                       cancelButtonTitle:@"Cancel"
                                       otherButtonTitles:nil, nil];
      [av show];
      return;
    }

    NSMutableDictionary *userInfoDic =
        [(NSMutableDictionary *)[NSJSONSerialization
            JSONObjectWithData:responseDataUserinfo
                       options:0
                         error:nil] mutableCopy];

    callback(@[ userInfoDic ]);
  } @catch (NSException *exception) {
    callback(@[ @"error" ]);
  }
}

- (NSString *)getAppSecret {
  if ([gAppSecret isEqualToString:@""]) {
    NSArray *list = [[[NSBundle mainBundle] infoDictionary]
        valueForKey:@"CFBundleURLTypes"];
    for (NSDictionary *item in list) {
      NSString *name = item[@"CFBundleURLName"];
      if ([name isEqualToString:@"weixin"]) {
        NSArray *schemes = item[@"CFBundleURLSchemes"];
        if (schemes.count > 0) {
          gAppSecret = schemes[1];
          break;
        }
      }
    }
    return gAppSecret;
  } else {
    return gAppSecret;
  }
}

- (NSData *)webRequest:(NSURL *)urlStr {
  @try {
    NSMutableURLRequest *request =
        [[NSMutableURLRequest alloc] initWithURL:urlStr];
    [request setHTTPMethod:@"GET"];     //设置发送方式
    [request setTimeoutInterval:60000]; //设置连接超时
    //[request setValue:length forHTTPHeaderField:@"Content-Length"];
    ////设置数据长度
    [request setValue:@"application/json"
        forHTTPHeaderField:@"Content-Type"]; //设置发送数据的格式
    [request setValue:@"application/json"
        forHTTPHeaderField:@"Accept"]; //设置预期接收数据的格式

    NSHTTPURLResponse *urlResponse = nil;
    NSError *error = [[NSError alloc] init];
    NSData *responseData = [NSURLConnection sendSynchronousRequest:request
                                                 returningResponse:&urlResponse
                                                             error:&error];
    return responseData;
  } @catch (NSException *exception) {
    return nil;
  }
}
@end
