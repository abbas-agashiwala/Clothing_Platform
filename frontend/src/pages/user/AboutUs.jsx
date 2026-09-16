export default function AboutUs() {
  return (
    <div className="container py-5 py-md-6">
      <div className="text-center mb-5 mx-auto max-w-3xl">
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-clay">About StyleHub</p>
        <h1 className="fw-bold text-white">Style made simple.</h1>
        <p className="text-muted">
          Welcome to StyleHub – your destination for modern and stylish clothing.
        </p>
      </div>

      <div className="row g-4">
        <div className="col-md-6">
          <div className="card h-100 border-0 p-4 p-md-5 shadow-soft">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-clay">01 / Who we are</p>
          <h2 className="h3 fw-bold text-white">Fashion for everyday life.</h2>
          <p>
            StyleHub is a modern clothing e-commerce platform designed to make
            shopping simple, convenient, and enjoyable.
          </p>
          <p>
            We offer a wide range of fashionable clothing and accessories for
            different styles and occasions.
          </p>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card h-100 border-0 p-4 p-md-5 shadow-soft">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-clay">02 / Our mission</p>
          <h2 className="h3 fw-bold text-white">Good style, within reach.</h2>
          <p>
            Our mission is to provide high-quality fashion products at
            affordable prices while delivering a smooth and secure shopping
            experience.
          </p>
          </div>
        </div>
      </div>
    </div>
  );
}
