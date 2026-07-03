import os

EM = "\u2014"
root = os.path.join(os.path.dirname(__file__), "..", "templates")

for dirpath, _, files in os.walk(root):
    for fname in files:
        if not fname.endswith(".html"):
            continue
        path = os.path.join(dirpath, fname)
        with open(path, encoding="utf-8") as f:
            text = f.read()
        if EM not in text:
            continue
        new = text
        new = new.replace(f" {EM} BloBax", " | BloBax")
        new = new.replace(f"{EM} BloBax", "| BloBax")
        new = new.replace(f'|default:"{EM}"', '|default:"N/A"')
        new = new.replace(f"|default:'{EM}'", "|default:'N/A'")
        new = new.replace(f">{EM}<", ">N/A<")
        new = new.replace(f"{EM} Select {EM}", "Select")
        new = new.replace(f" {EM} ", ", ")
        new = new.replace(f"{EM} ", "")
        new = new.replace(f" {EM}", ",")
        if new != text:
            with open(path, "w", encoding="utf-8") as f:
                f.write(new)
            print("fixed", os.path.relpath(path, root))
