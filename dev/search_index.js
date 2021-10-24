var documenterSearchIndex = {"docs":
[{"location":"#NotebookToLatex.jl","page":"Home","title":"NotebookToLatex.jl","text":"","category":"section"},{"location":"#Why-this-Package?","page":"Home","title":"Why this Package?","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"This package converts your notebook files (Pluto or Jupyter) to beautiful and simple LaTeX files, that are easy to modify. Thus, making it ideal to write reports, articles or books from notebooks.","category":"page"},{"location":"","page":"Home","title":"Home","text":"Although it's already possible to convert both Pluto and Jupyter notebooks to PDFs, or even to LaTeX (via Pandoc), the PDFs are not very customizable and the LaTeX files are usually very messy. In contrast, NotebookToLatex.jl focuses less in generality, and more on opinionated defaults.","category":"page"},{"location":"","page":"Home","title":"Home","text":"The package has it's own implementation to parse Markdown to LaTeX, e.g. it turns # Example to \\chapter{Example}. Thus, one can dive down into the actual Julia code and customize it for his own preference. Or, submit an issue requesting the feature. Hopefully, more and more customization will be possible from the get go as the package evolves.","category":"page"},{"location":"","page":"Home","title":"Home","text":"Another very important point to note is that NotebookToLatex.jl uses julia-mono-listing. This enables it to produce beautiful Julia code inside the LaTeX pdf. Note that it requires using lualatex for compilation.","category":"page"},{"location":"#Getting-Started","page":"Home","title":"Getting Started","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"This package is very simple to use. There is pretty much just one function to be used, i.e.","category":"page"},{"location":"","page":"Home","title":"Home","text":"notebooktolatex","category":"page"},{"location":"#NotebookToLatex.notebooktolatex","page":"Home","title":"NotebookToLatex.notebooktolatex","text":"notebooktolatex(notebook, targetdir=\"./build_latex\"; template=:book, fontpath=nothing)\n\nTakes a notebook file, converts it to Latex and creates a file structure with figures, fonts and listing files.\n\ntargetdir is the target directory where the Latex project will be created.\n\nIf the directory does no exists, it is created.\n\ntemplate - The template for the Latex file. It's based on Latex templates.\n\nCurrent supported templates are :book, :mathbook.\n\nfontpath - The output Latex files uses JuliaMono fonts in order to support the\n\nunicodes that are also supported in Julia. If the user already has JuliaMono installed, he can provide the path to where the .ttf files are stored. If nothing is passed, then the font files will be downloaded and saved in the ./fonts/ folder.\n\n\n\n\n\n","category":"function"},{"location":"#Basic-Use","page":"Home","title":"Basic Use","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"To convert the notebooks just use notebooktolatex(\"mynotebook.jl\", template=:book). This will produce a directory ./build_latex/ where the LaTeX files will be generated. Inside build_latex/ you will have:","category":"page"},{"location":"","page":"Home","title":"Home","text":"build_latex\n│   main.tex\n│   julia_font.tex\n│   julia_listings.tex\n│   julia_listings_unicode.tex\n│   preface.tex\n│\n└───figures\n│   │   mynotebook_plot1.png\n│   └───mynotebook_plot2.png\n└───fonts\n│   │   JuliaMono_Regular.ttf\n│   │   ...\n│   \n└───frontmatter\n│   │   titlepage.tex\n│   └───copyright.tex\n│\n└───notebooks\n    └───mynotebook.tex","category":"page"},{"location":"","page":"Home","title":"Home","text":"Using template=:book, we get the LaTeX book format, thus, we have a preface.tex, a titlepage.tex and a copyright.tex page. The notebook will be included as a chapter. To get your final book pdf, just compile the main.tex using lualatex.","category":"page"},{"location":"","page":"Home","title":"Home","text":"In case you want a different project folder, you can run the command with an extra argument providing the target directory for the LaTeX files, e.g.:","category":"page"},{"location":"","page":"Home","title":"Home","text":"`notebooktolatex(\"mynotebook.jl\", \"./project/\",template=:book)`.","category":"page"},{"location":"","page":"Home","title":"Home","text":"This will create a ./project/ folder instead of the ./build_latex.","category":"page"},{"location":"#Font-JuliaMono","page":"Home","title":"Font - JuliaMono","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"Note that when you run notebooktolatex without providing a fontpath, this will install the .ttf files in the project directory. You might instead run the command with the path to the folder containing the JuliaMono fonts (at the moment, the package requires this specific font in order to properly deal with unicode symbols). Here is an example:","category":"page"},{"location":"","page":"Home","title":"Home","text":"notebooktolatex(\"mynotebook.jl\", template=:book,\n        fontpath=\"/home/davibarreira/.local/share/fonts/Unknown Vendor/TrueType/JuliaMono/\")","category":"page"},{"location":"","page":"Home","title":"Home","text":"Note that I've used /home/username instead of ~/. This is necessary for LaTeX to correctly find your fonts. You can also do this manually by changing the julia_font.tex file.","category":"page"},{"location":"#Templates","page":"Home","title":"Templates","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"At the moment, the available templates are:","category":"page"},{"location":"","page":"Home","title":"Home","text":":book - The standard LaTeX book template;\n:mathbook - Very similar to :book, but with some extra packages already imported.","category":"page"},{"location":"#Plots-and-Images","page":"Home","title":"Plots and Images","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"At the moment, this package works with either Makie.jl (CairoMakie.jl) and/or Plots.jl. These packages are actually dependencies, and they are used to save the plots from Pluto notebooks. This is not necessary for the Jupyter converter. In a near future, I intend to create a separate package for each converter, and use NotebookToLatex.jl as a main package containing both.","category":"page"},{"location":"","page":"Home","title":"Home","text":"Also important to note is that, while notebooks are good at displaying svg images, this is not the case with LaTeX, which handles pdf images better. Hence, if you have ![Example](figure.svg), this figure will be converted to a pdf using Librsvg_jll.","category":"page"},{"location":"#Workflow","page":"Home","title":"Workflow","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"Once the LaTeX files are generated, you can modify your notebooks and run the notebooktolatex command again. This will only modify the notebook LaTeX file and the figures, while all the other LaTeX files will stay fixed. If you run the command for a new notebook, it won't overwrite your current files, it will only add an include{newnotebook} to the main.tex. Hence, you can convert each notebook one at a time.","category":"page"},{"location":"#Jupyter-Vs.-Pluto","page":"Home","title":"Jupyter Vs. Pluto","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"Jupyter notebooks store the outputs in the notebook file, while Pluto notebooks are simple Julia scripts. Hence, when converting notebooks, the Jupyter notebooks will be faster (way faster) to convert, since for the Pluto notebook, the converter will have to run the actual notebook. Thus, if you intend to constantly modify and convert your Pluto notebooks, it's advised to have a REPL (or a notebook!)  with Julia running constantly, in order to avoid precompiling every time. After converting the Pluto notebook the first time, the next time should be quite fast.","category":"page"},{"location":"#For-Developers-and-Forkers","page":"Home","title":"For Developers and Forkers","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"If you want to contribute to this package or if you want to modify it for your own use, this section is relevant. Here is a brief description of this package inner working. At this moment, the src/ contains five main Julia files:","category":"page"},{"location":"","page":"Home","title":"Home","text":"templates.jl - Contains the main.tex, preface.tex, and other .tex files templates.","category":"page"},{"location":"","page":"Home","title":"Home","text":"If you want to alter the current template, you can just modify this script. Note that there are some important lines that should be modified with care. For example, the % INCLUDE NOTEBOOKS HERE % is used in the code in order to identify where to include the notebooks;","category":"page"},{"location":"","page":"Home","title":"Home","text":"auxiliarytex.jl - Similar to templates.jl, but it's used to generate","category":"page"},{"location":"","page":"Home","title":"Home","text":"the julia_font.tex, julia_listings.tex and julia_listings_unicode.tex;","category":"page"},{"location":"","page":"Home","title":"Home","text":"helperfunction.jl - Contains a collection of small helper functions, such are","category":"page"},{"location":"","page":"Home","title":"Home","text":"functions to add text to files in specific lines, creating folders, etc;","category":"page"},{"location":"","page":"Home","title":"Home","text":"markdowntolatex.jl - Here is where the Markdown parser is;\nNotebookToLatex - The functions to convert both Pluto and Jupyter are here.","category":"page"},{"location":"","page":"Home","title":"Home","text":"Another thing to note is that inside the main.tex file there is a comment line with %! TeX program = lualatex. This is necessary for people using vimtex plugin for Vim. This line will tell the plugin to compile using luatex, which is necessary.","category":"page"},{"location":"#TODO","page":"Home","title":"TODO","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"This package is still in it's earlier stages, so here is a list of things still left to be done:","category":"page"},{"location":"","page":"Home","title":"Home","text":"Add new templates;\nEnable easier way of customizing parser, for example, removing numbering in sections;\nEnable to pass a caption in the code listings (e.g.","category":"page"},{"location":"","page":"Home","title":"Home","text":"\\begin{lstlisting}[language=JuliaLocal, style=julia, caption=SOR Algorithm, numbers=left]);","category":"page"},{"location":"","page":"Home","title":"Home","text":"Add \\vline before code (?);\nAdd other color schemes;","category":"page"}]
}
