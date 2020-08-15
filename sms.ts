import { postAsync } from "./request"
import crypto = require('crypto');
import qs = require('querystring');

export interface SmsSdkConfig {
    /** 选择发短信平台,chuanglan:创蓝,netease:网易云信 */
    method: 'chuanglan' | 'netease';
    /** 创蓝api帐号 */
    account?: string;
    /** 创蓝api密码 */
    password?: string;
    /** 创蓝发短信接口地址 */
    url?: string;
    /** 网易云信appkey */
    appKey?: string;
    /** 网易云信AppSecret */
    appSecret?: string;
}

export interface ContentParam1 {
    templateid: string;
    mobiles: Array<string>;
    params?: Array<string>;
    needUp?: boolean;
}

export interface ContentParam2 {
    templateid?: string;
    mobile: string;
    codeLen?: number;
    authCode?: string;
    needUp?: boolean;
}

export interface ClSendResult {
    code: string;
    msgId: string;
    time: string;
    errorMsg: string;
}

export interface sendMessResult {
    code: number;
    msg: string;
    obj: string;
}

export interface sendCodeResult {
    code: number;
    msg: string;
    obj: string;
}

export class SmsSdk {
    private config: SmsSdkConfig;
    private logFunc?: (s: any) => void

    constructor(config: SmsSdkConfig) {
        if (config.method == 'chuanglan') {
            if (!config.account) {
                throw Error('config.account is required');
            }
            if (!config.password) {
                throw Error('config.password is required');
            }
            if (!config.url) {
                throw Error('config.url is required');
            }
        }

        if (config.method == 'netease') {
            if (!config.appKey) {
                throw Error('config.appKey is required');
            }
            if (!config.appSecret) {
                throw Error('config.appSecret is required');
            }
        }

        this.config = { ...config };
        this.logFunc = null
    }

    /** 计算字符串的sha1 */
    private sha1(str: string) {
        return crypto.createHash('sha1').update(str).digest('hex');
    }

    /** 创建随机数,长度<128 */
    private createNonce() {
        return Math.floor(Math.random() * 0xFFFFFF) + '';
    }

    /** 设置打印函数 */
    public setLogFunc(func: (s: any) => void) {
        this.logFunc = func;
    }

    /**
     * @description: 创蓝接口发短信
     * @param {string} phone 目标手机号
     * @param {string} content 短信内容
     * @return {Promise}
     */
    public async clSend(phone: string, content: string): Promise<ClSendResult | string> {
        if (!this.config.account || !this.config.password || !this.config.url) {
            throw Error('Missing configuration information');
        }
        let options = {
            method: 'POST',
            url: this.config.url,
            body: {
                'account': this.config.account,
                'password': this.config.password,
                'phone': phone,
                'msg': content,
                'report': 'false',
            },
            headers: {
                'Content-Type': 'application/json; charset=UTF-8',
            },
            json: true
        };
        this.logFunc && this.logFunc(`send message->function:clSend, phone:${phone}, content:${content}`)
        let a = await postAsync(options)
        return a
    }

    /**
     * @description: 网易云信api发送通知类和运营类短信
     * @param {Object} content 具体数据,格式为:{templateId: '模板id', mobiles: ['手机号1','手机号2'], params: ['短信内容参数1','短信内容参数2']}
     * @return {Promise} 返回Promise对象,成功时得到云信平台返回的json体,其他情况下抛出问题原因
     */
    public async sendMessByNetease(content: ContentParam1): Promise<sendMessResult | string> {
        let curTime = String(Date.now() / 1000 >> 0); //当前时间秒数
        let nonce = this.createNonce();
        let appKey = this.config.appKey;
        let appSecret = this.config.appSecret;
        if (!appKey || !appSecret) {
            throw Error('Missing configuration information');
        }

        let checkSum = this.sha1(appSecret + nonce + curTime);
        let options = {
            method: 'POST',
            url: 'https://api.netease.im/sms/sendtemplate.action',
            headers: {
                'AppKey': appKey,
                'Nonce': nonce,
                'CurTime': curTime,
                'CheckSum': checkSum,
                "Content-Type": "application/x-www-form-urlencoded",
                "charset": "utf-8"
            },
            body: qs.stringify({
                templateid: content.templateid,
                mobiles: JSON.stringify(content.mobiles),
                params: JSON.stringify(content.params || [])
            })
        };
        this.logFunc && this.logFunc(`send message->method:sendMessByNetease, phone:${JSON.stringify(content.mobiles)}, content:${JSON.stringify(content.params || [])}`)
        let a = await postAsync(options);
        return JSON.parse(a);
    }

    /**
     * @description: 网易云信api发送短信/语音短信验证码
     * @param {Object} content
     * @param {string} content.templateid 模板编号(如不指定则使用配置的默认模版)
     * @param {string} content.mobile 目标手机号
     * @param {string} content.codeLen 定义验证码长度,由服务商生成验证码
     * @param {string} content.authCode 自定义验证码,如果设置了该参数，则codeLen参数无效
     * @param {boolean} content.needUp 是否需要支持短信上行。true:需要，false:不需要.说明：如果开通了短信上行抄送功能，该参数需要设置为true，其它情况设置无效
     * @return {Promise} 返回Promise对象,成功时得到云信平台返回的json体,其他情况下抛出问题原因
     */
    public async sendCodeByNetease(content: ContentParam2): Promise<sendCodeResult | string> {
        let curTime = String(Date.now() / 1000 >> 0); //当前时间秒数
        let nonce = this.createNonce();
        let appKey = this.config.appKey;
        let appSecret = this.config.appSecret;

        if (!appKey || !appSecret) {
            throw Error('Missing configuration information')
        }

        if (!content.mobile || (!content.codeLen && !content.authCode)) {
            throw Error('内容参数不完整,请检查mobile,codeLen或authCode是否已传入')
        }

        let checkSum = this.sha1(appSecret + nonce + curTime);
        let options = {
            method: 'POST',
            url: 'https://api.netease.im/sms/sendcode.action',
            headers: {
                'AppKey': appKey,
                'Nonce': nonce,
                'CurTime': curTime,
                'CheckSum': checkSum,
                "Content-Type": "application/x-www-form-urlencoded",
                "charset": "utf-8"
            },
            body: qs.stringify({ ...content })
        };
        this.logFunc && this.logFunc(`send message->method:sendCodeByNetease, phone:${content.mobile}, content:${content.authCode || content.codeLen}`)
        let a = await postAsync(options);
        return JSON.parse(a);
    }
}