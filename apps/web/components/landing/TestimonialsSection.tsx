import { Star } from 'lucide-react';

interface Testimonial {
  rating: number;
  content: string;
  author: string;
  position: string;
  initials: string;
  color: string;
}

const testimonials: Testimonial[] = [
  {
    rating: 5,
    content: "RepAi has completely transformed our customer service. We never miss a lead now, and our response time went from hours to seconds.",
    author: "Sarah Miller",
    position: "Founder, TechStart",
    initials: "SM",
    color: "blue"
  },
  {
    rating: 5,
    content: "The setup was incredibly easy, and now our AI handles 80% of customer inquiries. It's like having a 24/7 team member.",
    author: "Mike Johnson",
    position: "Owner, Local Store",
    initials: "MJ",
    color: "green"
  },
  {
    rating: 5,
    content: "Our customer satisfaction scores improved dramatically. The AI is so natural, customers often don't realize they're not talking to a human.",
    author: "Lisa Chen",
    position: "Director, Growth Co",
    initials: "LC",
    color: "purple"
  }
];

export default function TestimonialsSection() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Trusted by thousands of businesses
          </h2>
          <p className="text-xl text-gray-600">
            See how RepAi is transforming customer relationships
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-white rounded-xl p-8 shadow-sm border">
              <div className="flex items-center mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star
                    key={i}
                    className="h-5 w-5 text-yellow-400 fill-current"
                  />
                ))}
              </div>
              <p className="text-gray-600 mb-6">
                &ldquo;{testimonial.content}&rdquo;
              </p>
              <div className="flex items-center">
                <div className={`h-12 w-12 rounded-full bg-${testimonial.color}-100 flex items-center justify-center mr-4`}>
                  <span className={`text-${testimonial.color}-600 font-semibold`}>
                    {testimonial.initials}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{testimonial.author}</p>
                  <p className="text-sm text-gray-500">{testimonial.position}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}


