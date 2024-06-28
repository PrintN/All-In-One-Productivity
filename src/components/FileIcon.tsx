import HtmlIcon from 'devicon/icons/html5/html5-plain.svg';
import CssIcon from 'devicon/icons/css3/css3-plain.svg';
import ReactIcon from 'devicon/icons/react/react-original.svg';
import TypeScriptIcon from 'devicon/icons/typescript/typescript-plain.svg';
import JsIcon from 'devicon/icons/javascript/javascript-plain.svg';
import GitIcon from 'devicon/icons/git/git-plain.svg';
import NodeJsIcon from 'devicon/icons/nodejs/nodejs-plain.svg';
import RustIcon from 'devicon/icons/rust/rust-original.svg';
import JsonIcon from 'devicon/icons/json/json-plain.svg';
import PythonIcon from 'devicon/icons/python/python-original.svg';
import JavaIcon from 'devicon/icons/java/java-plain.svg';
import CppIcon from 'devicon/icons/cplusplus/cplusplus-plain.svg';
import CSharpIcon from 'devicon/icons/csharp/csharp-plain.svg';
import PhpIcon from 'devicon/icons/php/php-plain.svg';
import RubyIcon from 'devicon/icons/ruby/ruby-plain.svg';
import GoIcon from 'devicon/icons/go/go-plain.svg';
import SwiftIcon from 'devicon/icons/swift/swift-plain.svg';
import DockerIcon from 'devicon/icons/docker/docker-plain.svg';
import KubernetesIcon from 'devicon/icons/kubernetes/kubernetes-plain.svg';
import MarkdownIcon from 'devicon/icons/markdown/markdown-original.svg';
import BinaryIcon from '../images/binary.png'; // URL to the binary icon image
import ImageIcon from '../images/image.png'; // URL to the image icon
import ContentIcon from '../images/content.png'; // URL to the content icon

interface Icons {
  [key: string]: React.FunctionComponent<React.SVGProps<SVGSVGElement>> | string;
}

const icons: Icons = {
  html: HtmlIcon,
  css: CssIcon,
  tsx: ReactIcon,
  ts: TypeScriptIcon,
  js: JsIcon,
  svg: ImageIcon,
  png: ImageIcon,
  icns: ImageIcon,
  ico: ImageIcon,
  gif: ImageIcon,
  jpeg: ImageIcon,
  jpg: ImageIcon,
  tiff: ImageIcon,
  bmp: ImageIcon,
  json: JsonIcon,
  md: MarkdownIcon,
  lock: ContentIcon,
  gitignore: GitIcon,
  rs: RustIcon,
  py: PythonIcon,
  java: JavaIcon,
  cpp: CppIcon,
  cs: CSharpIcon,
  php: PhpIcon,
  rb: RubyIcon,
  go: GoIcon,
  swift: SwiftIcon,
  docker: DockerIcon,
  k8s: KubernetesIcon,
};

interface IFileIconProps {
  name: string;
  size?: 'sm' | 'base';
}

export default function FileIcon({ name, size = 'base' }: IFileIconProps) {
  const lastDotIndex = name.lastIndexOf('.');
  const ext = lastDotIndex !== -1 ? name.slice(lastDotIndex + 1).toLowerCase() : 'NONE';
  const cls = size === 'base' ? 'w-4' : 'w-3';

  const Icon = typeof icons[ext] === 'string' ? icons[ext] : icons[ext] || BinaryIcon;

  return typeof Icon === 'string' ? <img className={cls} src={Icon} alt={name} /> : <Icon className={cls} />;
}
