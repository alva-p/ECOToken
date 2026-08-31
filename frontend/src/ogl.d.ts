declare module 'ogl' {
  export class Renderer {
    constructor(opts?: any);
    gl: any;
    setSize(w: number, h: number): void;
    render(opts: any): void;
  }
  export class Program {
    constructor(gl: any, opts: any);
    uniforms: any;
  }
  export class Mesh {
    constructor(gl: any, opts: any);
  }
  export class Triangle {
    constructor(gl: any);
  }
}
