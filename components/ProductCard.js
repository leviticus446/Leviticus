import CornerFrame from './CornerFrame';

export default function ProductCard({ name, price, image, description }) {
  return (
    <div className="group">
      <CornerFrame className="overflow-hidden rounded-sm">
        <div
          className="aspect-[4/5] bg-forest/10 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
          style={{ backgroundImage: `url(${image})` }}
        />
      </CornerFrame>
      <h3 className="font-display text-2xl text-forest mt-4">{name}</h3>
      {description && <p className="text-sm text-forest/60 mt-1">{description}</p>}
      <p className="text-gold text-sm tracking-wide mt-2">Rp {price.toLocaleString('id-ID')}</p>
    </div>
  );
}
