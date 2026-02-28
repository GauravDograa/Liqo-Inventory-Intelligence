interface Props {
  title: string;
  content: string;
}

export default function HelpSection({ title, content }: Props) {
  return (
    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
      <h2 className="text-lg font-semibold mb-3">{title}</h2>
      <p className="text-gray-600 leading-relaxed">
        {content}
      </p>
    </div>
  );
}