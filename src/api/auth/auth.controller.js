// const crypto = require('crypto');
const { google } = require('googleapis');
const Joi = require('@hapi/joi');
const Account = require('models/account');
const SocialAccount = require('models/socialAccount');
const { getSocialProfile } = require('lib/getSocialProfile');

// const cipher = crypto.createCipher('aes-256-cbc', process.env.CIPHER_HIDDEN_KEY);
// const decipher = crypto.createDecipher('aes-256-cbc', process.env.CIPHER_HIDDEN_KEY);


// 로컬 회원가입
exports.localRegister = async (ctx) => {
  // 데이터 검증
  const schema = Joi.object().keys({
    name: Joi.string().min(2).required(),
    username: Joi.string().alphanum().min(4).max(10).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required()
  });

  console.log(ctx.request.body);
  
  const result = await schema.validateAsync(ctx.request.body);

  if(result.error) {
      ctx.status = 400;
      return;
  }
  
  // 계정 생성
  let account = null;
  try {
      account = await Account.localRegister(ctx.request.body);
  } catch (e) {
      ctx.throw(500, e);
  }

  let token = null;
  try {
      token = await account.generateToken();
  } catch (e) {
      ctx.throw(500, e);
  }

  ctx.cookies.set('access_token', token, { httpOnly: true, maxAge: 1000 * 60 * 60 * 24 * 7 });
  ctx.body = account.profile; // 프로필 정보로 응답합니다.
};

exports.localLogin = async (ctx) => {
  const schema = Joi.object().keys({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  });
  console.log('login 요청');
  const result = schema.validate(ctx.request.body);
  console.log(result);
  if(result.error) {
    ctx.status = 400;
    console.log('error');
    // ctx.throw(400, '아이디 비밀번호 오류');
    return;
  }

  const { email, password } = ctx.request.body;

  let account = null;
  
  try {
    account = await Account.findByEmail(email);
  } catch (e) {
    ctx.throw(500, e);
  }

  if(!account || !account.validatePassword(password)) {
  // 유저가 존재하지 않거나 || 비밀번호가 일치하지 않으면
      ctx.status = 403;
      return;
  }

  let token = null;
  try {
      token = await account.generateToken();
  } catch (e) {
      ctx.throw(500, e);
  }

  ctx.cookies.set('access_token', token, { httpOnly: true, maxAge: 1000 * 60 * 60 * 24 * 7 });
  ctx.body = account.profile; // 프로필 정보로 응답합니다.
};

exports.exists = async (ctx) => {
  // 만약 socialRegister에서 들어올 경우라면 무조건 username만 들어옴.
  const { key, value } = ctx.params;
  let account = null;

  try {
    // account = await (key === 'email' ? Account.findByEmail(value) : Account.findByUsername(value))
    // key가 username이라면 Account먼저 찾아보고 값 없으면 SocialAccount도 찾기
    // 아니면 그대로
    if(key === 'username') {
      console.log('username 들어옴');
      account = await Account.findByUsername(value) || await SocialAccount.findByUsername(value)
    } else {
      console.log('email 들어옴');
      console.log(key, value);
      account = await Account.findByEmail(value);
    }
  } catch (e) {
    ctx.throw(500, e);
  }

  console.log(account);
  ctx.body = {
    exists: account !== null
  }
};

exports.logout = async (ctx) => {
  ctx.cookies.set('access_token', null, {
    maxAge: 0,
    httpOnly: true
  });
  ctx.status = 204;
};

exports.check = (ctx) => {
  const { user } = ctx.request;

  if(!user) {
    ctx.status = 403;
    return;
  }

  ctx.body = user.profile;
};

exports.socialExists = async (ctx) => {
  const { accessToken } = ctx.request.body;
  const { provider } = ctx.params;

  try {
    // 가지고있는 accessToken과 provider를 결합하여 유저정보 get
    const result = await getSocialProfile(provider, accessToken);
    console.log(result);
    
    const { email } = result;
    // 현재 socialAccount에 정보 있는지 확인
    let account;

    account = await SocialAccount.findByEmail({ provider, email });

    // 동일 이메일이 server에 있을 경우
    // 해당 유저를 찾아서 보내줌. 
    console.log(account, result.email);
    ctx.body = account.profile || email;

    // console.log(account);
    // 확인 후에 유저정보가 있다면 이를 account.username을 return 해준다.
  } catch (e) {
    ctx.throw(500, e);
  }
};

// social 계정 생성
exports.socialRegister = async (ctx) => {
  console.log(ctx.request.body);
  
  let account = null;
  try {
    account = await SocialAccount.socialRegister(ctx.request.body);
  } catch (e) {
    console.log("계정오류");
    ctx.throw(500, e);
  }

  console.log(account);
  // let token = null;
  // try {
  //   token = await account.generateToken();
  // } catch (e) {
  //   console.log("톺큰오류");
  //   ctx.throw(500, e);
  // }

  // ctx.cookies.set('access_token', token, { httpOnly: true, maxAge: 1000 * 60 * 60 * 24 * 7 });
  ctx.body = account.profile; // 프로필 정보로 응답합니다.
};

exports.getSocialToken = async (ctx) => {
  const { code } = ctx.request.query;

  const callbackUrl = 'http://localhost:4000/api/auth/callback/google'

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_ID,
    process.env.GOOGLE_SECRET,
    callbackUrl
  );

  try {
    const { tokens } = await oauth2Client.getToken(code);
    if (!tokens) {
      ctx.status = 401;
      return;
    }
    const { access_token } = tokens;

    let nextUrl = `http://localhost:3000/auth/login/social/callback?type=google&key=${access_token}`;

    ctx.redirect(nextUrl);
  } catch (e) {
    ctx.throw(500, e);
  }
};

exports.verifySocial = async (ctx) => {
  const { accessToken } = ctx.request.body;
  const { provider } = ctx.params;
  
  let profile;

  try {
    profile = await getSocialProfile(provider, accessToken);
  } catch (e) {
    console.log(e);
    ctx.status = 401;
    ctx.body = {
      name: 'WRONG_CREDENTIAL',
    };
  }

  if(!profile) {
    ctx.status = 401;
    ctx.body = {
      name: 'WRONG_CREDENTIAL',
    };
    return;
  }

  console.log(profile);

  try {
    const [user, socialAccount] = await Promise.all([
      profile.email
        ? Account.findByEmail(profile.email)
        : Promise.resolve(null),
      SocialAccount.findBySocialId(profile.id),
    ]);


    // exists에 값이 없을경우 값을 보내주어 socialRegister하도록 함.
    // console.log('user: ',user);
    // console.log('SA: ', socialAccount);
    // console.log(!!(socialAccount || user))
    // exists에 값이 있을 경우는 ..?
    const exists = !!(socialAccount || user);

    // 이쪽 코드가 너무 투박한데 ..?
    if(!exists) {
      ctx.body = {
        profile,
        exists
      };
    }
    // exists 가 true인 경우
    if(user) {
      ctx.body = {
        user,
        exists,
      }
    } else {
      ctx.body = {
        socialAccount,
        exists
      }
    }
    
    
  } catch (e) {
    ctx.throw(500, e);
  }
}