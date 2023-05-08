import React from 'react';
import { useBestRatedBooks } from '../../../lib/customHooks';
import BookItem from '../BookItem/BookItem';
import styles from './BestRatedBooks.module.css';

function BestRatedBooks() {
  const { bestRatedBooks } = useBestRatedBooks();

  const bestRatedBooksContent = bestRatedBooks.length > 0 ? (
    bestRatedBooks.map((book) => (
      <BookItem key={book.id} book={book} size={3} />
    ))
  ) : (
    <h3>Aucune recommandation</h3>
  );

  return (
    <section className={`content-container ${styles.BestRatedBooks}`}>
      <h2>Les mieux notés</h2>
      <div className={styles.List}>{bestRatedBooksContent}</div>
    </section>
  );
}

export default BestRatedBooks;
