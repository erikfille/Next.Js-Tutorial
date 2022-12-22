import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";

const postsDirectory = path.join(process.cwd(), "posts");

export function getSortedPostsData() {
  // Toma los archivos bajo el directorio /posts
  const fileNames = fs.readdirSync(postsDirectory);
  const allPostsData = fileNames.map((fileName) => {
    // Elimina la extensión ".md" para sacar el nombre como id del archivo
    const id = fileName.replace(/\.md$/, "");

    // Lee el archivo Markdown como un string
    const fullPath = path.join(postsDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, "utf8");

    // Usa gray-matter para parsear la sección de metadata de los posts
    const matterResult = matter(fileContents);

    // Combina la data con el id
    return {
      id,
      ...matterResult.data,
    };
  });

  // Ordena los posts por fecha
  return allPostsData.sort((a, b) => {
    if (a.date < b.date) {
      return 1;
    } else {
      return -1;
    }
  });
}

// También se puede traer información de una API con fetch

/*

export async function getSortedPostsData() {
  // Instead of the file system,
  // fetch post data from an external API endpoint
  const res = await fetch('..');
  return res.json();
}

*/

// También permite hacer queries a las Databases, ya que getStaticProps solo corre en el lado del servidor, nunca del lado del cliente

/*

import someDatabaseSDK from 'someDatabaseSDK'

const databaseClient = someDatabaseSDK.createClient(...)

export async function getSortedPostsData() {
  // Instead of the file system,
  // fetch post data from a database
  return databaseClient.query('SELECT posts...')
}

*/

export function getAllPostIds() {
  // guarda todos los ids de los posts para pasarle a getStaticPath
  const fileNames = fs.readdirSync(postsDirectory); // busca los nombres de archivos en el directorio /posts

  // Retorna un array de objetos como el siguiente:
  // [ { params: { id: 'ssg-ssr' } }, { params: { id: 'pre-rendering' } } ]

  return fileNames.map((fileName) => {
    return {
      params: {
        id: fileName.replace(/\.md$/, ""),
      },
    };
  });
}

/*

Importante: La lista que retorna la función de arriba no es solo un array de strings, sino que debe ser un array de objetos que se ven como el ejemplo del comentario. Cada objeto debe tener una key "params" y debe contener un objeto con la key "id" (ya que estamos usando [id] en el nombre del archivo). De otra manera, la funcion getStaticPaths fallará.

También, getAllPostsIds puede traer info de un endpoint de API externa, de la siguiente manera:

export async function getAllPostIds() {
  // En lugar del archivo del sistema,
  // trae la info del post de un endpoint de API externa
  const res = await fetch('..');
  const posts = await res.json();
  return posts.map((post) => {
    return {
      params: {
        id: post.id,
      },
    };
  });
}

*/

export async function getPostData(id) { // el async se utiliza para poder usar el await de remark, y requiere que getStaticProps tiene que actualizarse para usar await
  const fullPath = path.join(postsDirectory, `${id}.md`); // guarda el path al post
  const fileContents = fs.readFileSync(fullPath, "utf8"); // guarda el contenido del post

  // Usamos gray-matter para parsear la sección de metadata del post
  const matterResult = matter(fileContents);

  // Usamos remark para convertir el formato markdown a un string HTML

  const processedContent = await remark()
    .use(html)
    .process(matterResult.content);

  const contentHtml = processedContent.toString();

  // Combinamos la data con el id y contentHtml
  return {
    id,
    contentHtml,
    ...matterResult.data,
  };
}
