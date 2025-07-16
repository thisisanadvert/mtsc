import type { SVGProps } from "react";

export function PunchIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 10a4 4 0 1 0-8 0 4 4 0 0 0 8 0z" />
      <path d="M18 10a2 2 0 1 0-4 0 2 2 0 0 0 4 0z" />
      <path d="M14 10a6 6 0 0 0-12 0h12v6a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-3a3 3 0 0 0-3-3H4" />
    </svg>
  );
}

export function KickIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M14.5 7.5a2.5 2.5 0 0 1-3 4" />
      <path d="m21 12-5 2-3-3-4 2-4-1" />
      <path d="M12 21a2 2 0 1 0-4 0 2 2 0 0 0 4 0Z" />
      <path d="m4.5 4.5 1.5 1.5" />
    </svg>
  );
}
