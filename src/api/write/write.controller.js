const Write = require('models/write');
const Joi = require('@hapi/joi');

exports.loadPost = async (ctx) => {
  const { id } = ctx.params;
  console.log(id);

  let post = null;
  try {
    post = await Write.loadPost(id);
  } catch (e) {
    console.log(e);
  }

  console.log(post);
  ctx.body = post;
}

exports.loadPosts = async (ctx) => {
  let posts = null;
  try {
    posts = await Write.loadPosts();
    const limitPostLength = post => ({
      ...post,
      content: post.content.length < 150 ? post.content : `${post.content.slice(0, 200)}...`
    });

    ctx.body = posts.map(limitPostLength);
  } catch (e) {
    console.log(e);
  }
};

exports.newPost = async (ctx) => {
  
  console.log(ctx.request.body);
  // 유효성검사
  const schema = Joi.object().keys({
    title: Joi.string().max(10).required(),
    content: Joi.string().required(),
    author: Joi.string().max(10).required() 
  });

  const result = await schema.validateAsync(ctx.request.body);

  if(result.error) {
    ctx.status = 400;
    return;
  }

  // 해당 객체 저장
  let post = null;

  try {
    post = await Write.postRegister(ctx.request.body);
  } catch (e) {
    ctx.throw(500, e);
  }
  
  console.log("포스팅 성공");
  ctx.body = post;
};