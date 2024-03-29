const postService = require("../service/postService");
const postTagService = require("../service/postTagService");
const logEditService = require("../service/logEditService");
const accountService = require("../service/accountService");
const accountReadService = require("../service/accountReadService");
const followService = require("../service/followService");
const { statusCode, errorResponse } = require("../utils/errorResponse");
const database = require("../config/database");
const { sequelize } = database;

exports.createPost = async (req, res) => {
  const { account_id } = req.jwt;
  const { text, post_tags, refer_post_id, img, publish_status } = req.body;
  try {
    const post = await postService.createPost({
      account_id,
      text,
      refer_post_id,
      img,
      publish_status,
    });
    for (let i = 0; i < post_tags.length; i++) {
      const tag = post_tags[i];
      await postTagService.createPostTag({
        tag_id: tag.tag_id,
        post_id: post.post_id,
      });
    }
    res.status(200).send({
      status: "success",
    });
  } catch (error) {
    console.log(error);
    errorResponse(res, {
      statusResponse: 500,
      statusCode: statusCode(1001),
      errorMessage: error,
    });
  }
};

exports.createPostArticle = async (req, res) => {
  const { account_id } = req.jwt;
  const { text, tag_id, cover_image_url, img, owner, title } = req.body;
  try {
    const account = await accountService.getAccountByAccountId(account_id);
    if (account.role != "Psychologist")
      return errorResponse(res, {
        statusResponse: 401,
        statusCode: statusCode(2007),
        errorMessage: `Account Id(${account_id}) don't have permission to create Article post.`,
      });
    const post = await postService.createPost({
      account_id,
      text,
      tag_id,
      cover_image_url,
      img,
      owner,
      title,
      post_type: "Article",
    });
    res.status(200).send({
      status: "success",
    });
  } catch (error) {
    console.log(error);
    errorResponse(res, {
      statusResponse: 500,
      statusCode: statusCode(1001),
      errorMessage: error,
    });
  }
};

exports.getPost = async (req, res) => {
  const { post_id } = req.params;
  const { account_id = null } = req.jwt;
  let { count_read = false } = req.query;
  try {
    let post = await postService.getPostByPostId(post_id, account_id);
    if (!post)
      return errorResponse(res, {
        statusResponse: 404,
        statusCode: statusCode(3001),
        errorMessage: `Post Id(${post_id}) Does not exist`,
      });
    if (count_read && account_id) {
      const account_read =
        await accountReadService.getAccountReadByAccountIdAndPostId(
          account_id,
          post.post_id
        );
      if (account_read) {
        let last_read = new Date(account_read.last_read).getTime();
        let current_date = new Date().getTime();
        if (current_date > last_read + 3600 * 1000 * 24) {
          await accountReadService.updateAccountRead(
            account_read.account_read_id,
            { last_read: sequelize.fn("NOW") }
          );
          await postService.updatePost(post.post_id, {
            count_read: post.count_read + 1,
          });
        }
      } else {
        await accountReadService.createAccountRead({
          account_id,
          post_id: post.post_id,
          last_read: sequelize.fn("NOW"),
        });
        await postService.updatePost(post.post_id, {
          count_read: post.count_read + 1,
        });
      }
      post = await postService.getPostByPostId(post_id, account_id);
    }
    return res.status(200).send({ post });
  } catch (error) {
    console.log(error);
    errorResponse(res, {
      statusResponse: 500,
      statusCode: statusCode(1001),
      errorMessage: error,
    });
  }
};

exports.getAllPost = async (req, res) => {
  const { account_id = null } = req.jwt;
  try {
    const posts = await postService.getAllPost(account_id);
    return res.status(200).send({ posts });
  } catch (error) {
    console.log(error);
    errorResponse(res, {
      statusResponse: 500,
      statusCode: statusCode(1001),
      errorMessage: error,
    });
  }
};

exports.getAllPostAccountPagination = async (req, res) => {
  const my_account_id = req.jwt.account_id;
  const { account_id } = req.params;
  let { limit = 5, page = 1, post_type = "Post" } = req.query;
  limit = parseInt(limit);
  page = parseInt(page);
  let offset = page === 1 ? 0 : (page - 1) * limit;
  try {
    const account = await accountService.getAccountByAccountId(account_id);
    if (!account)
      return errorResponse(res, {
        statusResponse: 404,
        statusCode: statusCode(2003),
        errorMessage: `Account Id(${account_id}) Does not exist`,
      });
    const posts = await postService.getAllPostAccountPagination(
      account_id,
      limit,
      offset,
      my_account_id,
      post_type
    );
    return res.status(200).send({ posts });
  } catch (error) {
    console.log(error);
    errorResponse(res, {
      statusResponse: 500,
      statusCode: statusCode(1001),
      errorMessage: error,
    });
  }
};

exports.getAllPostPagination = async (req, res) => {
  const { account_id = null } = req.jwt;
  let {
    limit = 5,
    page = 1,
    post_type = "Post",
    order_count_read = false,
  } = req.query;
  limit = parseInt(limit);
  page = parseInt(page);
  let offset = page === 1 ? 0 : (page - 1) * limit;
  try {
    const posts = await postService.getAllPostPagination(
      limit,
      offset,
      account_id,
      post_type,
      order_count_read
    );
    return res.status(200).send({ posts });
  } catch (error) {
    console.log(error);
    errorResponse(res, {
      statusResponse: 500,
      statusCode: statusCode(1001),
      errorMessage: error,
    });
  }
};

exports.getAllPostByTagIdOrPostTagAndSearchPagination = async (req, res) => {
  const { account_id = null } = req.jwt;
  let {
    limit = 5,
    page = 1,
    post_type = "Post",
    tag_id = "",
    search = "",
    follow = false,
  } = req.query;
  limit = parseInt(limit);
  page = parseInt(page);
  let offset = page === 1 ? 0 : (page - 1) * limit;
  tag_id = tag_id == "" ? [] : tag_id.split(",");
  follow = follow == "true";
  try {
    let account_follows_id = [];
    if (follow && account_id) {
      const account_follows = await followService.getFollowByAccountIdFollower(
        account_id
      );
      account_follows_id = account_follows.map(
        (account_follow) => account_follow.account.account_id
      );
    }
    let posts;
    if (post_type == "Post") {
      posts = await postService.getAllPostByPostTagAndSearchPagination(
        limit,
        offset,
        account_id,
        post_type,
        tag_id,
        search,
        follow,
        account_follows_id
      );
    } else {
      posts = await postService.getAllPostByTagIdAndSearchPagination(
        limit,
        offset,
        account_id,
        post_type,
        tag_id,
        search,
        follow,
        account_follows_id
      );
    }
    return res.status(200).send({ posts });
  } catch (error) {
    console.log(error);
    errorResponse(res, {
      statusResponse: 500,
      statusCode: statusCode(1001),
      errorMessage: error,
    });
  }
};

exports.getAllMyPost = async (req, res) => {
  const { account_id } = req.jwt;
  try {
    const posts = await postService.getAllMyPost(account_id);
    return res.status(200).send({ posts });
  } catch (error) {
    console.log(error);
    errorResponse(res, {
      statusResponse: 500,
      statusCode: statusCode(1001),
      errorMessage: error,
    });
  }
};

exports.getAllMyPostPagination = async (req, res) => {
  const { account_id } = req.jwt;
  let { limit = 5, page = 1, post_type = "Post" } = req.query;
  limit = parseInt(limit);
  page = parseInt(page);
  let offset = page === 1 ? 0 : (page - 1) * limit;
  try {
    const posts = await postService.getAllMyPostPagination(
      account_id,
      limit,
      offset,
      post_type
    );
    return res.status(200).send({ posts });
  } catch (error) {
    console.log(error);
    errorResponse(res, {
      statusResponse: 500,
      statusCode: statusCode(1001),
      errorMessage: error,
    });
  }
};

exports.getAllRepost = async (req, res) => {
  const { refer_post_id } = req.params;
  const { account_id = null } = req.jwt;
  try {
    const posts = await postService.getAllRepost(refer_post_id, account_id);
    return res.status(200).send({ posts });
  } catch (error) {
    console.log(error);
    errorResponse(res, {
      statusResponse: 500,
      statusCode: statusCode(1001),
      errorMessage: error,
    });
  }
};

exports.updatePost = async (req, res) => {
  const { account_id } = req.jwt;
  const { post_id, text, post_tags, img, publish_status } = req.body;
  try {
    const post = await postService.getPostByPostId(post_id);
    if (!post)
      return errorResponse(res, {
        statusResponse: 404,
        statusCode: statusCode(3001),
        errorMessage: `Post Id(${post_id}) Does not exist`,
      });
    if (post.account.account_id != account_id)
      return errorResponse(res, {
        statusResponse: 401,
        statusCode: statusCode(2007),
        errorMessage: `Account Id(${account_id}) don't have permission to edit Post Id(${post_id})`,
      });
    await postService.updatePost(post_id, { text, img, publish_status });
    for (let i = 0; i < post.post_tags.length; i++) {
      const { post_tag_id } = post.post_tags[i];
      if (!post_tags.map((pt) => pt.post_tag_id).includes(post_tag_id)) {
        await postTagService.updatePostTag(post_tag_id, {
          is_delete: true,
        });
      }
    }
    for (let i = 0; i < post_tags.length; i++) {
      const tag = post_tags[i];
      if (tag.post_tag_id) continue;
      await postTagService.createPostTag({
        tag_id: tag.tag_id,
        post_id,
      });
    }
    const log_data = {
      post_tags: post.post_tags,
      text: post.text,
      img: post.img,
    };
    await logEditService.createLogEdit({ post_id, log_data });
    res.status(200).send({
      status: "success",
    });
  } catch (error) {
    console.log(error);
    errorResponse(res, {
      statusResponse: 500,
      statusCode: statusCode(1001),
      errorMessage: error,
    });
  }
};

exports.updatePostArticle = async (req, res) => {
  const { account_id } = req.jwt;
  const { post_id, text, tag_id, cover_image_url, img, owner, title } =
    req.body;
  try {
    const post = await postService.getPostByPostId(post_id);
    if (!post)
      return errorResponse(res, {
        statusResponse: 404,
        statusCode: statusCode(3001),
        errorMessage: `Post Id(${post_id}) Does not exist`,
      });
    if (post.account.account_id != account_id)
      return errorResponse(res, {
        statusResponse: 401,
        statusCode: statusCode(2007),
        errorMessage: `Account Id(${account_id}) don't have permission to edit Post Id(${post_id})`,
      });
    await postService.updatePost(post_id, {
      text,
      tag_id,
      cover_image_url,
      img,
      owner,
      title,
    });
    const log_data = {
      text: post.text,
      post_tags: post.post_tags,
      tag_id: post.tag_id,
      cover_image_url: post.cover_image_url,
      img: post.img,
      owner: post.owner,
      title: post.title,
    };
    await logEditService.createLogEdit({ post_id, log_data });
    res.status(200).send({
      status: "success",
    });
  } catch (error) {
    console.log(error);
    errorResponse(res, {
      statusResponse: 500,
      statusCode: statusCode(1001),
      errorMessage: error,
    });
  }
};

exports.deletePost = async (req, res) => {
  const { account_id } = req.jwt;
  const { post_id } = req.params;
  try {
    const post = await postService.getPostByPostId(post_id);
    if (!post)
      return errorResponse(res, {
        statusResponse: 404,
        statusCode: statusCode(3001),
        errorMessage: `Post Id(${post_id}) Does not exist`,
      });
    if (post.account.account_id != account_id)
      return errorResponse(res, {
        statusResponse: 401,
        statusCode: statusCode(2007),
        errorMessage: `Account Id(${account_id}) don't have permission to delete Post Id(${post_id})`,
      });
    await postService.updatePost(post_id, { is_delete: true });
    return res.status(200).send({ status: "success" });
  } catch (error) {
    console.log(error);
    errorResponse(res, {
      statusResponse: 500,
      statusCode: statusCode(1001),
      errorMessage: error,
    });
  }
};
