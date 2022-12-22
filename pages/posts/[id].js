import Layout from "../../components/layout";
import { getAllPostIds, getPostData } from "../../lib/posts";
import Head from "next/head";
import Date from "../../components/date";
import utilStyles from "../../styles/utils.module.css";

export async function getStaticProps({ params }) {
  // devuelve las props a traves de pasarle los params que saca a traves de getStaticPaths()
  const postData = await getPostData(params.id); // necesita el await para que remark pueda hacer lo suyo en getPostData
  return {
    props: {
      postData,
    },
  };
}

export async function getStaticPaths() {
  const paths = getAllPostIds();
  return {
    paths, // paths contiene un array de los paths conocidos que retorna getAllPostIds(), que incluye los params definidos por pages/posts/[id].js
    fallback: false,
  };
}

/*

Que significa fallback en el retorno de la función de arriba?

Indica el comportamiento si el path de la pagina no esta entre los retornados.

- Si es false, cualquier path no retornado por getStaticPaths resultara en una pagina 404

- Si es true, el comportamiento de getStaticProps cambia:

a. Los paths retornados de getStaticPaths se renderizarán al HTML en la construccion de la pagina
b. Los paths que no se hayan generado al momento de la construccion, no resultaran en una pagina 404. En lugar de esto, Next.js mostrará una version "fallback" de la pagina en el primer request a ese path.
c. En el fondo, Next.js generará de manera estatica el path solicitado. Solicitudes subsecuentes al mismo path devolveran la pagina generada, tal como hacen las otras paginas pre-renderizadas en la construccion.

- Si es "blocking", los nuevos paths se renderizarán del lado del servidor con getStaticProps, y se cachear'an para futuros requests, para que esto suceda solo una vez por path.

*/

export default function Post({ postData }) {
  // dangerouslySetInnerHTML agrega contenido HTML directamente en el DOM
  return (
    <Layout>
      <Head>
        <title>{postData.title}</title>
      </Head>
      <article>
        <h1 className={utilStyles.headingXl}>{postData.title}</h1>
        <div className={utilStyles.lightText}>
          <Date dateString={postData.date} />
        </div>
        <div dangerouslySetInnerHTML={{ __html: postData.contentHtml }} />
      </article>
    </Layout>
  );
}

/*

Para crear páginas con rutas dinamicas, necesitamos:

1) Crear una pagina dentro de la carpeta "pages", con la sintaxis [nombredelparams].js, que contenga:

- Un componente de React para renderizar en la pagina
- getStaticPaths que retorna un array de posibles valores por id
- getStaticProps, que trae la data necesaria para el la pagina con el id correspondiente

*/

/*

Las rutas dinamicas se pueden extender para captar todos los paths a traves de agregar tres puntos entre los corchetes (ej: [...id].js).
Esto dara como resultado algo como lo siguiente:
pages/posts/[...id].js matchea /posts/a, pero también /posts/a/b, /posts/a/b/c, y asi...

si se hace esto, en getStaticPaths se debe retornar un array como el valor del key id, del estilo:

return [
    {
        params: {
            // Generación estatica de /posts/a/b/c
            id: ["a","b","c"]
        }
    }
    // ...
]

Y a su vez, params.id será un array en getStaticProps

export async function getStaticProps({ params }) {
  // params.id sería algo como ['a', 'b', 'c']
}

*/
