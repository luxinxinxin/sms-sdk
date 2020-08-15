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

declare class SmsSdk {
    private config: SmsSdkConfig;
    private logFunc?: (s: any) => void;
    constructor(config: SmsSdkConfig);
    private sha1;
    private createNonce;

    /** 设置打印函数 */
    setLogFunc(func: (s: any) => void): void;

    /**
     * @description: 创蓝接口发短信
     * @param {string} phone 目标手机号,多个手机号码使用英文逗号分隔,必填
     * @param {string} content 短信内容
     * @return {Promise}
     */
    clSend(phone: string, content: string): Promise<ClSendResult | string>;

    /**
     * @description: 网易云信api发送通知类和运营类短信
     * @param {Object} content 具体数据,格式为:{templateId: '模板id', mobiles: ['手机号1','手机号2'], params: ['短信内容参数1','短信内容参数2']}
     * @return {Promise} 返回Promise对象,成功时得到云信平台返回的json体,其他情况下抛出问题原因
     */
    sendMessByNetease(content: ContentParam1): Promise<sendMessResult | string>;

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
    sendCodeByNetease(content: ContentParam2): Promise<sendCodeResult | string>;
}
export default SmsSdk;