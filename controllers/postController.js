const postService = require("../service/postService");
const postTagService = require("../service/postTagService");


exports.createPost = async (req, res) => {
    const { account_id } = req.jwt
    const { text, post_tags, refer_post_id } = req.body;
    try {
      const post = await postService.createPost({ account_id, text, refer_post_id });
      for (let i = 0; i < post_tags.length; i++) {
        const tag = post_tags[i];
        await postTagService.createPostTag({ tag_id:tag.tag_id, post_id:post.post_id }); 
      }
      res.status(200).send({
        status: "success",
      });
    } catch (error) {
      console.log(error);
      res.status(400).send({
        status: "error",
        error: error,
      });
    }
};

exports.getPost= async (req,res)=>{
    const { post_id } = req.params
    try {
      const post = await postService.getPostByPostId(post_id)
      if (!post) return res.status(400).send({ status: "error", error: "Not found" });
      return res.status(200).send({ post })
    } catch (error) {
      console.log(error);
      res.status(400).send({
        status: "error",
        error: error,
      });
    } 
}

exports.getAllPost= async (req,res)=>{
    try {
      const posts = await postService.getAllPost()
      return res.status(200).send({ posts })
    } catch (error) {
      console.log(error);
      res.status(400).send({
        status: "error",
        error: error,
      });
    } 
}