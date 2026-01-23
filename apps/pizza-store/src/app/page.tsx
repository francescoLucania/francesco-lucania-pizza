import styles from './page.module.scss';

export default function Index() {
  /*
   * Replace the elements below with your own.
   *
   * Note: The corresponding styles are in the ./index.scss file.
   */
  return (
    <div>

      <section className='section'>
        <div className="container">
          <h2 className='heading-h2 text-center'>Популярное:</h2>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2 className='heading-h2 text-center'>Пицца:</h2>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2 className='heading-h2 text-center'>Паста:</h2>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2 className='heading-h2 text-center'>Казан/Мангал:</h2>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2 className='heading-h2 text-center'>Суп:</h2>
        </div>
      </section>
    </div>
  );
}
