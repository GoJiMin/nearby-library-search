import {TypeAnimation} from 'react-type-animation';
import {Heading} from '@/shared/ui';

function BrandMessage() {
  return (
    <Heading as="h1" size="display">
      <span className="text-accent">이 책, </span>
      <TypeAnimation
        sequence={['근처 도서관에 있나요?', 4000, '지금 빌릴 수 있나요?', 4000]}
        wrapper="span"
        speed={10}
        repeat={Infinity}
        cursor={true}
      />
    </Heading>
  );
}

export {BrandMessage};
