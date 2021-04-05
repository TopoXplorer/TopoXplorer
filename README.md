TopoXplorer
===============================

Topology-Based Visual Analytics Approach For Machine Learning Model Explanations

Installation
------------

To install use pip:

    $ pip install TopoXplorer

For a development installation (requires [Node.js](https://nodejs.org) and [Yarn version 1](https://classic.yarnpkg.com/)),

    $ git clone https://github.com/TopoXplorer/TopoXplorer.git
    $ cd TopoXplorer
    $ pip install -e .
    $ jupyter nbextension install --py --symlink --overwrite --sys-prefix TopoXplorer
    $ jupyter nbextension enable --py --sys-prefix TopoXplorer

When actively developing your extension for JupyterLab, run the command:

    $ jupyter labextension develop --overwrite TopoXplorer

Then you need to rebuild the JS when you make a code change:

    $ cd js
    $ yarn run build

You then need to refresh the JupyterLab page when your javascript changes.
