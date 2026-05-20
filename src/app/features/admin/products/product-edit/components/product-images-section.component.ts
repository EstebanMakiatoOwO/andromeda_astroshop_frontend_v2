import { Component, ElementRef, OnDestroy, ViewChild, computed, input, output, signal } from '@angular/core';
import { AssetUrlPipe } from '../../../../../shared/pipes/asset-url.pipe';

@Component({
  selector: 'app-product-images-section',
  standalone: true,
  imports: [AssetUrlPipe],
  templateUrl: './product-images-section.component.html',
})
export class ProductImagesSectionComponent implements OnDestroy {
  @ViewChild('fileInput') private fileInput!: ElementRef<HTMLInputElement>;

  images = input.required<string[]>();

  imagesChange = output<string[]>();
  fileChange   = output<File>();

  protected readonly previewUrl = signal<string | null>(null);

  protected readonly allImages = computed(() => {
    const preview = this.previewUrl();
    return preview ? [...this.images(), preview] : this.images();
  });

  protected openPicker(): void {
    this.fileInput.nativeElement.click();
  }

  protected onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const prev = this.previewUrl();
    if (prev) URL.revokeObjectURL(prev);
    this.previewUrl.set(URL.createObjectURL(file));
    this.fileChange.emit(file);
    (event.target as HTMLInputElement).value = '';
  }

  protected removeImage(index: number): void {
    const url = this.allImages()[index];
    if (url.startsWith('blob:')) {
      URL.revokeObjectURL(url);
      this.previewUrl.set(null);
    } else {
      this.imagesChange.emit(this.images().filter((_, i) => i !== index));
    }
  }

  ngOnDestroy(): void {
    const prev = this.previewUrl();
    if (prev) URL.revokeObjectURL(prev);
  }
}
