import { type FC } from 'react';

type TitleTextProps = {
  title: string;
};

export const TitleText: FC<TitleTextProps> = ({ title }) => (
  <span className="text-foreground font-heading text-md pointer-events-none absolute inset-x-0 flex items-center justify-center text-center font-medium">
    {title}
  </span>
);
