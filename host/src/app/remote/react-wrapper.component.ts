import { Component, ElementRef, AfterViewInit, OnDestroy, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { loadRemoteModule } from '@angular-architects/module-federation';
import * as React from 'react';
import * as ReactDOM from 'react-dom/client';

@Component({
  selector: 'app-react-wrapper',
  standalone: true,
  template: `<div #reactRoot></div>`
})
export class ReactWrapperComponent implements AfterViewInit, OnDestroy {
  @Input() remoteEntry = 'http://localhost:4202/remoteEntry.js';
  @Input() exposedModule = './App';

  private root?: ReactDOM.Root;

  constructor(private elementRef: ElementRef) {}

  ngAfterViewInit() {
    const reactRoot = this.elementRef.nativeElement.querySelector('div') as HTMLDivElement;
    this.loadAndRender(reactRoot);
  }

  async loadAndRender(domElement: HTMLDivElement) {
    try {
const module = await loadRemoteModule({
  type: 'script',
  remoteEntry: this.remoteEntry,
  remoteName: 'remoteReact', // ✅ ADD THIS
  exposedModule: this.exposedModule
});
      const ReactElement = module.default;
      this.root = ReactDOM.createRoot(domElement);
      this.root.render(React.createElement(ReactElement));
    } catch (error) {
      console.error('Failed to load React component:', error);
      domElement.innerHTML = '<p>Error loading React component</p>';
    }
  }

  ngOnDestroy() {
    this.root?.unmount();
  }
}