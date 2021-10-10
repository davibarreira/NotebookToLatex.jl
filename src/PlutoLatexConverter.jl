module PlutoLatexConverter
using ReadableRegex
using Plots
using Makie
using CairoMakie
export extractnotebook, collectoutputs, createfolders
export plutotolatex

include("templates.jl")
include("auxiliarytex.jl")

export createproject
export pkgpath
export downloadfonts


"""
    Runner is a module for controling the scope
    when running the notebook files, avoinding that any
    command interferes with the "outside" script.
"""
module Runner
end

function pkgpath()
    for font in readdir(joinpath(@__DIR__,"../templates/fonts/"))
        println(font)
    end
end

"""
    extractnotebook(notebook)
Reads a Pluto notebook file, extracts the code
and returns a dictionary with the code in organized form.
The output is a dictionary containing
* `codes`    - The cell code of each running cell;
* `contents` - Only the Julia code in the cell;
* `outputtag`- Whether the output is hidden or showing (read the `tagcelloutput()` function);
* `celltype` - Whether cell contains code or markdown;
* `view`     - Whether the code is hidden or showing (the "eye" icon in the notebook);
* `order`    - Order that the cells are displayed in the notebook;
e.g. `extractnotebook("./mynotebook.jl")`
"""
function extractnotebook(notebook, notebookname=nothing)
    s = read(notebook, String)
    cells = split(s, "# ╔═╡ ");
    # The first cell and the final 3 are not used
    codes, contents, outputtag, celltype = [],[],[],[]
    for cell in cells[2:end-3]
        push!(codes, cell[1:36])
        push!(contents, cell[38:end])
        push!(outputtag, endswith(rstrip(cell),";") ? "hideoutput" : "showoutput")
        push!(celltype, cell[38:42] == "md\"\"\"" ? "markdown" : "code")
    end
    
    # Get order and view type
    r = either("# ╠","# ╟")
    sortedcells = split(cells[end],Regex(r))
    sortedcodes = [cell[4:39] for cell in sortedcells[2:end-2]]
    order = [findfirst(isequal(scode),codes) for scode in  sortedcodes[1:end]]
    view  = [occursin("═",c) ? "showcode" : "hidecode" for c in sortedcells[2:end-2]]
    # Matching running order
    view  = view[[findfirst(isequal(scode),sortedcodes) for scode in  codes]]

    # inferring the notebook name
    # base on the notebook file path.
    if notebookname === nothing
        notebookname = split(notebook,"/")[end]
        if endswith(notebookname,".jl")
            # removes the ".jl" in the end
            notebookname = notebookname[1:end-3]
        end
    end
    
    notebookdata = Dict(:codes => codes, :notebookname => notebookname,
                        :contents => contents, :outputtag=>outputtag,
                        :celltype => celltype,:order=> order,:view=>view)
    return notebookdata
end

function collectoutputs(notebookdata, notebookfolder="./")
    figureindex = Dict(:i => 0)
    runpath = pwd()
    cd(notebookfolder)
    outputs = []
    for (i, content) ∈ enumerate(notebookdata[:contents])
        if notebookdata[:celltype][i] == "code"
            if startswith(lstrip(content),"begin") && endswith(rstrip(content),"end")
                ex = :($(Meta.parse(strip(content))))
            else
                ex = :($(Meta.parse("begin\n"*content*"\nend")))
            end
            
            s = string(ex.args[end])
            if contains(s, Regex(either("PlutoUI.LocalResource","LocalResource")))
                if findfirst(Regex(look_for(one_or_more(ANY),after="(\"",before="\")")),s) === nothing
                    Runner.eval(ex)
                    pathvariable = s[findfirst(Regex(look_for(one_or_more(ANY),after="(",before=")")),s)]
                    imagepath = Runner.eval(Meta.parse(pathvariable))
                else
                    imagepath = s[findfirst(Regex(look_for(one_or_more(ANY),after="(\"",before="\")")),s)]
                end
                push!(outputs,(:image,pwd()*"/"*imagepath))
            else
                io = IOBuffer();
                Base.invokelatest(show,
                    IOContext(io, :limit => true),"text/plain",
                    dispatch_output(Runner.eval(ex), notebookdata[:notebookname], runpath, figureindex));
                celloutput = String(take!(io))
                if celloutput == "nothing"
                    push!(outputs,(:nothing, ""))
                elseif startswith(celloutput, "Plot{Plots.")
                    push!(outputs,
                    (:plot,notebookdata[:notebookname]*"_"*"figure"*string(figureindex[:i])*".png"))
                elseif startswith(celloutput, "FigureAxisPlot()")
                    push!(outputs,
                    (:plot,notebookdata[:notebookname]*"_"*"figure"*string(figureindex[:i])*".pdf"))
                else
                    push!(outputs,(:text, celloutput))
                end
            end
        else
            push!(outputs,nothing)
        end
    end
    cd(runpath)
    return outputs
end

function dispatch_output(command_eval::Makie.FigureAxisPlot, notebookname, runpath, figureindex)
    figureindex[:i]+=1
    save(runpath*"/build_latex/figures/"*notebookname*"_"*"figure"*string(figureindex[:i])*".pdf", command_eval)
    return command_eval
end

function dispatch_output(command_eval::Plots.Plot, notebookname, runpath, figureindex)
    figureindex[:i]+=1
    savefig(command_eval,runpath*"/build_latex/figures/"*notebookname*"_"*"figure"*string(figureindex[:i])*".png")
    return command_eval
end

function dispatch_output(command_eval, notebookname, runpath, figureindex)
   return command_eval 
end

function createfolders(path="./")
    folder = path*"/build_latex/"
    if !isdir(folder)
        mkpath(folder*"/notebooks")
        mkpath(folder*"/figures")
        mkpath(folder*"/frontmatter")
    else
        if !isdir(folder*"/notebooks")
            mkpath(folder*"/notebooks")
        end
        if !isdir(folder*"/figures")
            mkpath(folder*"/figures")
        end
        if !isdir(folder*"/frontmatter")
            mkpath(folder*"/frontmatter")
        end
    end
end

function downloadfonts(path="./"; fontpath=nothing)
    if fontpath === nothing
        if !isdir(path*"/build_latex/fonts")
            mkpath(path*"/build_latex/fonts")
            fontsourcepath = joinpath(@__DIR__,"../templates/fonts/")
            println(fontsourcepath)
            for font in readdir(fontsourcepath)
                cp(joinpath(fontsourcepath, font),
                   joinpath(path*"/build_latex/fonts",font))
            end
        end
        julia_font_tex = path * "/build_latex/julia_font.tex"
        writetext(julia_font_tex, "./fonts,", 6)
    else
        julia_font_tex = path * "/build_latex/julia_font.tex"
        writetext(julia_font_tex, fontpath*",", 6)
    end
end

function createproject(path="./", template=:book)
    createfolders(path)
    createtemplate(path, template)
    createauxiliarytex(path)
    #= downloadfonts() =#
end

function skiplines(io::IO, n)
    i = 1
    while i <= n
       eof(io) && error("File contains less than $n lines")
       i += read(io, Char) === '\n'
    end
end

# Function based on https://discourse.julialang.org/t/write-to-a-particular-line-in-a-file/50179
function writetext(file::String, text::String, linenumber::Integer, endline=true)
    f = open(file, "r+");
    if endline
        skiplines(f, linenumber);
        skip(f, -1)
    else
        skiplines(f, linenumber-1);
    end
    mark(f)
    buf = IOBuffer()
    write(buf, f)
    seekstart(buf)
    reset(f)
    print(f, text);
    write(f, buf)
    close(f)
end

function insertlineabove(file::String, text::String, linenumber::Integer)
    if linenumber==1
        writetext(file, text*"\n", linenumber, false)
    else
        writetext(file, "\n"*text, linenumber-1)
    end
end

function insertlinebelow(file::String, text::String, linenumber::Integer)
    writetext(file, "\n"*text, linenumber)
end

function plutotolatex(notebookname; template=:book)

    createproject(dirname(notebookname), template)
    nb = extractnotebook(notebookname)
    if template == :book
        insertlinebelow(dirname(notebookname)*"/build_latex/main.tex",
        "\\include{./notebooks/"*nb[:notebookname]*"}", 58)
    elseif template == :mathbook
        insertlinebelow(dirname(notebookname)*"/build_latex/main.tex",
        "\\include{./notebooks/"*nb[:notebookname]*"}", 87)
    end
    outputs = collectoutputs(nb,dirname(notebookname));
    notebook = "./build_latex/notebooks/"*nb[:notebookname]*".tex"
    open(notebook, "w") do f
        write(f,"\\newpage\n")
        for i in nb[:order]
            if nb[:celltype][i] == "code" && nb[:view][i] == "showcode"
                write(f,"\n\\begin{lstlisting}[language=JuliaLocal, style=julia]\n")
                write(f, strip(nb[:contents][i]))
                write(f,"\n\\end{lstlisting}\n")
            end
            if nb[:celltype][i] == "code" && nb[:outputtag][i] == "showoutput"
                if outputs[i][1] == :text
                    write(f,"\n\\begin{verbatim}\n")
                    write(f, outputs[i][2])
                    write(f,"\n\\end{verbatim}\n")
                elseif outputs[i][1] == :plot
                    write(f,"\n\\begin{figure}[H]\n")
                    write(f,"\t\\centering\n")
                    write(f,"\t\\includegraphics[width=0.8\\textwidth]{./figures/"*outputs[i][2]*"}\n")
                    write(f,"\t\\label{fig:"*outputs[i][2]*"}\n")
                    write(f,"\n\\end{figure}\n")
                elseif outputs[i][1] == :image
                    write(f,"\n\\begin{figure}[H]\n")
                    write(f,"\t\\centering\n")
                    write(f,"\t\\includegraphics[width=0.8\\textwidth]{"*outputs[i][2]*"}\n")
                    write(f,"\t\\label{fig:"*outputs[i][2]*"}\n")
                    write(f,"\n\\end{figure}\n")
                end
            end
        end
    end
end

end
