// app.post("/api/test", upload.single("profilePic"), async (req, res) => {
//   console.log("req.file", req.file);

//   console.log("req.body", req.body);

//   const test = await imageUploader(req.file as Express.Multer.File);
//   console.log("test", test);

//   res.status(200).json({
//     success: true,
//     error: false,
//     message: "Welcome to the MERN Beauty Shop API",
//   });
// });
