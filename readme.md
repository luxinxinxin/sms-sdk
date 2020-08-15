# sms-sdk

创蓝短信平台和网易云信SDK

>第一次使用请于[创蓝短信平台](https://www.253.com/)或[网易云信](https://yunxin.163.com/)接入短信服务
>使用创蓝短信平台需要获取调用接口所使用的帐号、密码和接口地址
>使用网易云信平台需要创建应用并获取App Key和App Secret,使用相关功能请注意配置好短信签名和短信模版

#SDK 使用文档

## 1. 实例化SDK

```
//TypeScript
import SmsSdk from 'sms-sdk';
const clSmsSdk = new SmsSdk(SmsSdkConfig)
```

`SmsSdkConfig` 配置项

* 使用创蓝短信配置：
    * `method`: `String` 固定为'chuanglan' 
    * `account`: `String` 调用api的帐号
    * `password`: `String` 调用api的密码
    * `url`: `String` 接口地址
* 使用网易云信配置：
    * `method`:`String` 固定为'netease'
    * `appKey`: `String` API接口验证序号
    * `appSecret`:`String` API接口密钥

### 完整示例：

```
//TypeScript
import SmsSdk from 'sms-sdk';
const clSmsSdk = new SmsSdk({
    method: 'netease',
    appKey: 'e8bb3d963631ac02b6ab4b4c********',
    appSecret: '67ebaa******'
});
```


## 2.创蓝发短信接口调用

```
//TypeScript
try {
    let result = await clSmsSdk.clSend('13088796474', '你好，这是测试内容')
    // console.log(result);
} catch (e) {
    // ...
}
```

* 返回结果示例：
```
{ 
    code: '0',                  //状态码('0'代表提交成功，注意是string)
    msgId: '19031417030622229', //消息id
    time: '20190314170306',     //响应时间
    errorMsg: ''                //状态码说明（成功返回空）
}
```

## 3. 网易云信发送短信/语音短信验证码

```
//TypeScript
try {
     let content = {
            templateid: '309****',
            mobile: '1308879***',
            authCode: '123456'
        }
    let result = await clSmsSdk.sendCodeByNetease(content)
    // console.log(result);
} catch (e) {
    // ...
}
```

* 返回结果示例：
```
{
  "code": 200,      //状态码
  "msg": "88",      //此次发送的sendid
  "obj": "1908"     //此次发送的验证码
}
```

## 4.网易云信发送通知类和运营类短信

```
//TypeScript
try {
     let content = {
            templateid: '3029400', 
            mobiles: ['1308879****'], 
            params: ['您好！']
        }
    let result = await clSmsSdk.sendMessByNetease(content)
    // console.log(result);
} catch (e) {
    // ...
}
```

* 返回结果示例：
```
成功则在obj中返回此次发送的sendid(long),用于查询发送结果
复制"Content-Type": "application/json; charset=utf-8"
{
  "code":200,       //状态码
  "msg":"sendid",   //描述
  "obj":123         //此次发送的sendid
}
```