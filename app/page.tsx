import Head from 'next/head';
import DraggableList from '../components/DraggableList';

export default function Home() {
  return (
    <div>
      <Head>
        <title>Draggable List</title>
        <meta name="description" content="Draggable list example using Next.js and Tailwind CSS" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex flex-col items-start justify-center min-h-screen py-2 pl-10">
        <DraggableList />
      </main>
    </div>
  );
}
