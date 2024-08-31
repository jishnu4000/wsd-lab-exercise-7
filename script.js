const baseURL = "https://api.nytimes.com/svc/books/v3/lists/full-overview.json?api-key=7BWqwKVioD6Nv9WIRRvp8TptVOpPHCCP"

let allBooks = []
let currentPage = 1
const pageSize = 10
let totalPages = 1

const messageElement = document.getElementById("message")
const bookListElement = document.getElementById('book-list')
const prevButton = document.getElementById('prev-btn')
const nextButton = document.getElementById('next-btn')
const fetchBtn = document.getElementById('fetch-btn')
const sortSelect = document.getElementById('sort')
const searchInput = document.getElementById('search')

const removeDuplicates = (bookList) => {
  const seenBooks = new Set()
  return bookList.filter(book => {
    if (!seenBooks.has(book.title)) {
      seenBooks.add(book.title)
      return true
    }
    return false
  })
}

// FETCH BOOKS AND REMOVE DUPLICATES
const fetchBooks = async () => {
  try {
    const bookList = await fetch(baseURL)
      .then(response => response.json())
      .then(data => data.results.lists)

    let bookArray = []
    for (let i = 0; i < bookList.length; i++) {
      const books = bookList[i].books
      bookArray = bookArray.concat(books)
    }
    bookArray = removeDuplicates(bookArray)
    totalPages = Math.ceil(bookArray.length / pageSize)
    return bookArray
  } catch (error) {
    console.error("Error fetching data:", error)
  }
}

// PAGINATION DISPLAY
const displayBooks = (pageNum, books) => {
  const startIndex = (pageNum - 1) * pageSize
  const endIndex = startIndex + pageSize
  const currentPageBooks = books.slice(startIndex, endIndex)

  bookListElement.innerHTML = ''
  currentPageBooks.forEach(book => {
    const bookItem = document.createElement('div')
    bookItem.classList.add('book-item')

    bookItem.innerHTML = `
      <div class="book-image">
        <img src="${book.book_image}" alt="${book.title}">
      </div>
      <div class="book-info">
        <div class="book-title">${book.title}</div>
        <div class="book-author"><strong>Author:</strong> ${book.author}</div>
        <div class="book-desc">${book.description}</div>
      </div>
    `
    bookListElement.appendChild(bookItem)
  })

  prevButton.disabled = currentPage === 1
  nextButton.disabled = currentPage === totalPages
}

// EVENT LISTENERS
fetchBtn.addEventListener('click', async () => {
  messageElement.innerText = "Fetching books..."
  messageElement.style.display = "block"
  bookListElement.classList.add('none')
  allBooks = await fetchBooks()
  displayBooks(currentPage, allBooks)
  searchInput.disabled = false
  sortSelect.disabled = false
  bookListElement.classList.remove('none')
  messageElement.style.display = "none"
})

prevButton.addEventListener('click', () => {
  if (currentPage > 1) {
    currentPage--
    displayBooks(currentPage, allBooks)
  }
})

nextButton.addEventListener('click', () => {
  if (currentPage < totalPages) {
    currentPage++
    displayBooks(currentPage, allBooks)
  }
})

sortSelect.addEventListener('change', async () => {
  const order = sortSelect.value
  messageElement.innerText = "Fetching books..."
  messageElement.style.display = "block"
  bookListElement.classList.add('none')
  if (order === 'asc') {
    allBooks = allBooks.toSorted((a, b) => a.title.toLowerCase().localeCompare(b.title.toLowerCase()))
  } else if (order === 'desc') {
    allBooks = allBooks.toSorted((a, b) => b.title.toLowerCase().localeCompare(a.title.toLowerCase()))
  } else if (order === 'mpop') {
    allBooks = await fetchBooks()
  } else if (order === 'lpop') {
    allBooks = await fetchBooks()
    allBooks = allBooks.reverse()
  }
  currentPage = 1
  displayBooks(currentPage, allBooks)
  bookListElement.classList.remove('none')
  messageElement.style.display = "none"
})

searchInput.addEventListener('input', e => {
  const value = e.target.value
  const filteredBooks = allBooks.filter(book => {
    if (book.title.toLowerCase().startsWith(value.toLowerCase()) || book.author.toLowerCase().startsWith(value.toLowerCase())) {
      return true
    } else {
      return false
    }
  })

  if (filteredBooks.length === 0) {
    messageElement.innerText = "No books found"
    messageElement.style.display = "block"
  } else {
    messageElement.style.display = "none"
  }

  currentPage = 1
  displayBooks(currentPage, filteredBooks)
})