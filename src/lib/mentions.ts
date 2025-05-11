export function handleMentions(element: HTMLElement, searchFn: (query: string) => Promise<any>) {
  let dropdown: HTMLDivElement | null = null;

  element.addEventListener('input', async (e) => {
    const target = e.target as HTMLTextAreaElement;
    const pos = target.selectionStart;
    const text = target.value.slice(0, pos);
    const atPos = text.lastIndexOf('@');

    if (atPos > -1 && (pos - atPos > 1 || text[atPos + 1]?.match(/[\s]/))) {
      if (dropdown) dropdown.remove();
      return;
    }

    if (atPos > -1) {
      const query = text.slice(atPos + 1);
      const results = await searchFn(query);
      
      if (!dropdown) {
        dropdown = createMentionDropdown();
        document.body.appendChild(dropdown);
      }
      
      // Position dropdown near cursor
      const coords = getCaretCoordinates(target, pos);
      dropdown.style.top = `${coords.top + 30}px`;
      dropdown.style.left = `${coords.left}px`;
      
      // Populate results
      dropdown.innerHTML = results.map((item: any) => `
        <div class="mention-item" data-id="${item.id}" data-type="${item.entity_type}">
          ${item.name} (${item.entity_type})
        </div>
      `).join('');
    }
  });
}

function createMentionDropdown() {
  const dropdown = document.createElement('div');
  dropdown.className = 'mention-dropdown';
  dropdown.style.position = 'absolute';
  dropdown.style.background = 'white';
  dropdown.style.border = '1px solid #ccc';
  dropdown.style.maxHeight = '200px';
  dropdown.style.overflowY = 'auto';
  return dropdown;
} 