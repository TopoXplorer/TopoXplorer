import ipywidgets as widgets
from traitlets import Unicode, List, Dict
from traitlets import observe

import pandas as pd
import sklearn
from pandas.api.types import is_numeric_dtype
from sklearn.neighbors import kneighbors_graph
from sklearn.preprocessing import StandardScaler
from scipy.spatial.distance import squareform
from scipy.cluster.hierarchy import ward, leaves_list
import numpy as np 
import kmapper as km
from sklearn.manifold import TSNE
from .util import remove_duplicated_links, remove_graph_duplicates
from .GraphSim import graph_sim


# See js/lib/example.js for the frontend counterpart to this file.

@widgets.register
class Widget(widgets.DOMWidget):
    """An example widget."""

    # Name of the widget view class in front-end
    _view_name = Unicode('HelloView').tag(sync=True)
    _model_name = Unicode('HelloModel').tag(sync=True)
    _view_module = Unicode('xtc').tag(sync=True)
    _model_module = Unicode('xtc').tag(sync=True)
    _view_module_version = Unicode('^0.1.0').tag(sync=True)
    _model_module_version = Unicode('^0.1.0').tag(sync=True)

    projection = List([]).tag(sync=True)
    labels = List([]).tag(sync=True)
    similarity = List([]).tag(sync=True)
    method_names = List([]).tag(sync=True)
    table_columns = List([]).tag(sync=True)
    table_data = List([]).tag(sync=True)
    table_distribution = List([]).tag(sync=True)
    graph = Dict({}).tag(sync=True)
    lasso_index = List([]).tag(sync=True)
    highlight_distribution = List([]).tag(sync=True)
    updated_method = List([]).tag(sync=True)
    query_index = List([]).tag(sync=True)
    labels_name = Unicode('prediction').tag(sync=True)
    lasso_method_name = Unicode('').tag(sync=True)
    sql_query = Unicode('').tag(sync=True)
    exp_average = List([]).tag(sync=True)

    def initialize(self,df,exp,labels,method_names,topologies,projection=None):
        if not isinstance(df, pd.DataFrame):
            raise ValueError('df not pandas Dataframe')

        if projection is None:
            X = df.to_numpy()
            print('Computing projections from original data...')
            self.projection = TSNE(n_components=2,random_state=42).fit_transform(X).tolist()
        else:
            self.projection = np.array(projection).tolist()
            
        self.topologies = topologies
        self.method_names_unsorted = method_names
        self.labels_predictions = np.array(labels).astype(str).flatten()
        self.df = df

        print('Calculating similarities among graphs...')
        graphs_input = self.construct_graph_inputs(method_names,topologies)
        # self.graphs_input = graphs_input

        similarity,method_names = self.calculate_graph_sim(method_names,graphs_input)

        self.labels = self.labels_predictions.tolist()
        self.similarity = np.array(similarity).tolist()
        self.method_names = np.array(method_names).tolist()

        self.table_columns = df.columns.tolist()
        self.table_data = df.values.tolist()

        self.table_distribution = generate_histogram(df)

        self.graph = graphs_input
        self.data = df

        self.exp = exp
        scaler = StandardScaler()
        for key in self.exp:
            data =  scaler.fit_transform(self.exp[key])
            self.exp[key] = pd.DataFrame(data,columns=self.exp[key].columns)

    def construct_graph_inputs(self,method_names,topologies):
        #simplify graphs
        topo_simplified = []
        for graphs in topologies:
            g = []
            for graph in graphs:
                g.append(remove_graph_duplicates(graph))
            topo_simplified.append(g)
        #construct graph inputs
        graphs_input = {}
        for name,graphs in zip(method_names,topo_simplified):
            graph_sims = np.zeros((len(graphs),len(graphs)))
            for i,g1 in enumerate(graphs):
                for j , g2 in enumerate(graphs[i+1:]):
                    sim = graph_sim(g1,g2)
                    graph_sims[i,i+j+1] = sim
                    graph_sims[i+j+1,i] = sim
            choice = int(graph_sims.sum(0).argmax())
            graphs_input[name] = {'graph_choice':choice,'G_attr':graphs}
        return graphs_input

    def calculate_graph_sim(self,method_names,graphs_input):
        # measure similarity among graphs
        data = np.zeros((len(method_names),len(method_names)))
        i = 0
        for m in method_names:
            j = 0
            for m2 in method_names:
                if i<j:
                    choice_i = graphs_input[m]['graph_choice']
                    choice_j = graphs_input[m2]['graph_choice']
                    dist = graph_sim(graphs_input[m2]['G_attr'][choice_j],graphs_input[m]['G_attr'][choice_i])
                    data[i,j] = dist
                    data[j,i] = dist
                j+=1
            i+=1
        X = squareform(data)
        Z = ward(X)
        order = leaves_list(Z)
        names = np.array(list(method_names))[order]
        sim = data[order,:][:,order]
        return sim, names.tolist()

    def update_graph_sim(self,method_names,graphs_input,sim,method_name):
        idx = method_names.index(method_name)
        data = np.array(sim)
        choice = graphs_input[method_name]['graph_choice']
        graph = graphs_input[method_name]['G_attr'][choice]
        i = 0
        for m in method_names:
            if m != method_name:
                choice = graphs_input[m]['graph_choice']
                dist = graph_sim(graph,graphs_input[m]['G_attr'][choice])
                data[idx,i] = dist
                data[i,idx] = dist
            i += 1
        X = squareform(data)
        Z = ward(X)
        order = leaves_list(Z)
        names = np.array(list(method_names))[order]
        sim = data[order,:][:,order]
        return sim, names.tolist()

    def query_topologies_by_index(self,idx):
        idx = set(idx)
        topologies_new_all = []
        for topologies in self.topologies:
            t = []
            for topology in topologies:
                nodes = list(topology['nodes'].keys())
                node_exist = set()
                topology_new = {'nodes':{},'links':{}}
                for node in nodes:
                    set_new = idx & set(topology['nodes'][node])
                    if len(set_new) != 0:
                        node_exist.add(node)
                        topology_new['nodes'][node] = list(set_new)
                for link in topology['links']:
                    if link in node_exist:
                        new_links = []
                        for _link in topology['links'][link]:
                            if _link in node_exist:
                                new_links.append(_link)
                        if len(new_links) > 0 :
                            topology_new['links'][link] = new_links
                t.append(topology_new)
            topologies_new_all.append(t)
        return topologies_new_all

    def query(self,idx):
        topologies = self.query_topologies_by_index(idx)
        graphs_input = self.construct_graph_inputs(self.method_names_unsorted,topologies)
        # print(graphs_input)

        similarity,method_names = self.calculate_graph_sim(self.method_names_unsorted,graphs_input)

        df = self.df.iloc[idx,:]

        self.table_columns = df.columns.tolist()
        self.table_data = df.values.tolist()
        
        self.table_distribution = generate_histogram(df)

        self.graph = graphs_input
        self.data = df

        self.similarity = np.array(similarity).tolist()
        self.method_names = np.array(method_names).tolist()

    @observe('query_index')
    def query_from_projection(self,query_index):
        idx = [int(i) for i in self.query_index]
        self.query(idx)

    @observe('sql_query')
    def query_from_sql(self,sql_query):
        try:
            idx = self.df.query(self.sql_query).index
            # print(idx)
            self.query(idx)
        except:
            pass

    @observe('lasso_index')
    def highlight_histogram(self,lasso_index):
        histograms = []

        if len(self.lasso_index) == 0:
            for h in self.table_distribution:
                dist = {'name':h['name'],'distribution':[0 for i in h['distribution']],'edges':h['edges'],'type':h['type']}
                histograms.append(dist)
                self.highlight_distribution = histograms
            method_name = self.lasso_method_name
            describe = self.exp[method_name].describe().loc[['25%','50%','75%']].sort_values(by=['50%'],axis=1,ascending=False)
            self.exp_average = [describe.columns.tolist(), describe.values.tolist(),[float(np.array(self.exp[method_name]).min()),float(np.array(self.exp[method_name]).max())]]
            return
        
        method_name = self.lasso_method_name
        idx = [int(i) for i in self.lasso_index]
        describe = self.exp[method_name].iloc[idx,:].describe().loc[['25%','50%','75%']].sort_values(by=['50%'],axis=1,ascending=False)
        self.exp_average = [describe.columns.tolist(), describe.values.tolist(),[float(np.array(self.exp[method_name]).min()),float(np.array(self.exp[method_name]).max())]]
        df = self.df.iloc[idx,:]
        for h in self.table_distribution:
            c = h['name']
            if h['type'] == 'categorical':
                vals = df[c].value_counts()
                hist = {k:0 for k in self.data[c].dropna().unique()}
                for i in vals.index:
                    hist[i] = vals[i]
                edges = list(hist.keys())
                counts = [hist[e] for e in edges]
                histograms.append({'name':c,'distribution':counts,'edges':edges,'type':'categorical'})
            else:
                edges = h['edges']
                counts,e = np.histogram(df[c],edges)
                histograms.append({'name':c,'distribution':counts.tolist(),'edges':edges,'type':'numeric'})
        self.highlight_distribution = histograms

    @observe('labels_name')
    def labels_change(self,labels_name):
        self.get_labels()
    
    def get_labels(self):
        l = self.labels_name
        if l != 'prediction':
            self.labels = self.df[l].tolist()
        else:
            self.labels = self.labels_predictions.tolist()

    @observe('updated_method')
    def graph_change(self,updated_method):
        method_name, choice = self.updated_method
        self.graph[method_name]['graph_choice'] = int(choice)

        similarity, method_names = self.update_graph_sim(self.method_names,self.graph,self.similarity,method_name)
        
        self.similarity = np.array(similarity).tolist()
        self.method_names = np.array(method_names).tolist()

def generate_histogram(df):
    histograms = []
    for c in df.columns:
        if is_numeric_dtype(df[c]):
            counts, edges = np.histogram(df[c])
            histograms.append({'name':c,'distribution':counts.tolist(),'edges':edges.tolist(),'type':'numeric'})
        else:
            vals = df[c].value_counts()
            edges = vals.index.tolist()
            counts = vals.tolist()
            histograms.append({'name':c,'distribution':counts,'edges':edges,'type':'categorical'})
    return histograms


def get_topological_graph(data,exp,clusterer_param,projection=True,cover=[10, 0.1]):
    
    mapper = km.KeplerMapper(verbose=0)

    clusterer_param *= np.sqrt(data.shape[1])
    clusterer = sklearn.cluster.DBSCAN(eps=clusterer_param, min_samples=1) 

    if isinstance(projection, int):
        level_set = mapper.fit_transform(exp, projection=np.arange(projection).tolist())
        cover = km.Cover(cover[0],cover[1])
    else:
        level_set = exp
        cover = km.Cover(cover[0],cover[1])

    graph = mapper.map(level_set,
                       data,
                       clusterer=clusterer,
                       cover=cover)
    return remove_duplicated_links(remove_graph_duplicates(graph))