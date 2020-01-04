const functions = require('firebase-functions');

const admin = require("firebase-admin");
admin.initializeApp(functions.config().firebase);

const firestore = admin.firestore();
firestore.settings({timestampsInSnapshots: true})


// Obtener data de todos los posts
// exports.getAllPosts = functions.https.onRequest(async (req, res) => {
//   console.log(req)
//   const snapshot = await firestore.collection("posts").get()
//   const posts = snapshot.docs.map(doc => {
//     return {id: doc.id, ...doc.data()}
//   })

//   res.json({posts: posts})
// })

// Eliminar palabras no permitidas de los posts 
// exports.sanitizeContent = functions.firestore.document("posts/{postId}").onWrite(async (change) => {
//   if(!change.after.exists) {
//     return
//   }

//   const {content, sanitized} = change.after.data();
//   if(content && !sanitized) {
//     return change.after.ref.update({
//       content: content.replace(/INSERTAR PALABRA NO PERMITIDA/g, "************"),
//       sanitized: true
//     })
//   }

//   return null;
// })

// Borrar todos los comentarios de un usuario de cada post cuando éste elimine su cuenta
exports.deleteUserComments = functions.firestore.document("/users/{userId}").onDelete(async (snapshot, context) => {
  const {userId} = context.params;
  
  const postsRef = firestore.collection("posts")

  //Buscar los posts comentados por el usuario
  const commentedPosts = await postsRef.where("commentsUsers", "array-contains", userId).get()

  // Buscar las colecciones de comentarios de los posts
  const postsCommentsRef = commentedPosts.docs.map(doc => {
    return doc.ref.collection("comments")
  })

  // Extraer los snapshots de cada colección de comentarios donde sólo se incluyan los comentarios del usuario
  // Esta operación genera un array de arrays donde cada array interno es una colección de comentarios
  const postsCommentsPromises = postsCommentsRef.map(doc => doc.where("user.uid", "==", userId).get())
  const commentsRefs = await Promise.all(postsCommentsPromises);
  console.log(commentsRefs)

  // Extraer los ref de los documentos de cada colección de comentarios
  // Esta operación genera un array de arrays donde cada array interno contiene los refs de los comentarios de cada post
  const commentsDocs = commentsRefs.map(snapshot => snapshot.docs)
  console.log(commentsDocs)

  // Unir todos los refs de los comentarios en un solo array
  const commentsRefsArray = []
  commentsDocs.forEach(docArray => docArray.map(doc => commentsRefsArray.push(doc.ref)))
  console.log(commentsRefsArray)

  // Extraer los comentarios
  const commentsPromises = []
  commentsRefsArray.forEach(doc => commentsPromises.push(doc.get()))
  commentsRefsArray.forEach(doc => console.log(doc.parent.parent.path))
  const resolvedComments = await Promise.all(commentsPromises);
  
  // Finalmente, borrar todos los comentarios del usuario
  const deleteCommentsPromises = resolvedComments.map(doc => doc.ref.delete())
  await Promise.all(deleteCommentsPromises)  
})