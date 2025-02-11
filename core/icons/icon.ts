/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import type {Block} from '../block.js';
import type {BlockSvg} from '../block_svg.js';
import * as browserEvents from '../browser_events.js';
import type {IIcon} from '../interfaces/i_icon.js';
import {Coordinate} from '../utils/coordinate.js';
import * as dom from '../utils/dom.js';
import {Size} from '../utils/size.js';
import {Svg} from '../utils/svg.js';

export abstract class Icon implements IIcon {
  /**
   * The position of this icon relative to its blocks top-start,
   * in workspace units.
   */
  protected offsetInBlock: Coordinate = new Coordinate(0, 0);

  /** The position of this icon in workspace coordinates. */
  protected workspaceLocation: Coordinate = new Coordinate(0, 0);

  /** The root svg element visually representing this icon. */
  protected svgRoot: SVGGElement | null = null;

  constructor(protected sourceBlock: Block) {}

  getType(): string {
    return 'abstract type';
  }

  initView(pointerdownListener: (e: PointerEvent) => void): void {
    if (this.svgRoot) return; // The icon has already been initialized.

    const svgBlock = this.sourceBlock as BlockSvg;
    this.svgRoot = dom.createSvgElement(Svg.G, {'class': 'blocklyIconGroup'});
    svgBlock.getSvgRoot().appendChild(this.svgRoot);
    this.updateSvgRootOffset();
    browserEvents.conditionalBind(
      this.svgRoot,
      'pointerdown',
      this,
      pointerdownListener
    );
  }

  dispose(): void {}

  getWeight(): number {
    return -1;
  }

  getSize(): Size {
    return new Size(0, 0);
  }

  applyColour(): void {}

  updateEditable(): void {}

  updateCollapsed(): void {
    if (!this.svgRoot) {
      throw new Error(
        'Attempt to update the collapsed-ness of an icon before its ' +
          'view has been initialized.'
      );
    }
    if (this.sourceBlock.isCollapsed()) {
      this.svgRoot.style.display = 'none';
    } else {
      this.svgRoot.style.display = 'block';
    }
  }

  hideForInsertionMarker(): void {
    if (!this.svgRoot) return;
    this.svgRoot.style.display = 'none';
  }

  isShownWhenCollapsed(): boolean {
    return false;
  }

  setOffsetInBlock(offset: Coordinate): void {
    this.offsetInBlock = offset;
    this.updateSvgRootOffset();
  }

  private updateSvgRootOffset(): void {
    this.svgRoot?.setAttribute(
      'transform',
      `translate(${this.offsetInBlock.x}, ${this.offsetInBlock.y})`
    );
  }

  onLocationChange(blockOrigin: Coordinate): void {
    this.workspaceLocation = Coordinate.sum(blockOrigin, this.offsetInBlock);
  }

  onClick(): void {}
}
