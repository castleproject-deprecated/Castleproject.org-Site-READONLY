private static readonly TimeSpan cacheDuration = TimeSpan.FromHours(2);
private static readonly int pageSize = 5;
private static readonly System.Text.RegularExpressions.Regex urlRx = new System.Text.RegularExpressions.Regex("^https?://", RegexOptions.Compiled);

private static bool IsUrl(string s) {	
	try {
		new Uri(s);
		return urlRx.IsMatch(s);
	} catch {
		return false;
	}
}

private static System.Xml.XmlDocument Fetch(string url) {
	System.Xml.XmlDocument feed = new System.Xml.XmlDocument();
	System.Net.WebRequest request = System.Net.WebRequest.Create(url);
	using (System.Net.HttpWebResponse response = (System.Net.HttpWebResponse)request.GetResponse())
	using (System.IO.Stream responseStream = response.GetResponseStream())
	  feed.Load(responseStream);
	return feed;
}

private static string UrlFetch(int index) {
	return string.Format("http://pipes.yahoo.com/pipes/pipe.run?_id=a931d4b9c1bcfc26a8d9edf349a47c35&_render=rss&limit={0}&index={1}", pageSize, index);
}

private static string ToQueryString(System.Collections.Specialized.NameValueCollection nv) {
	System.Collections.Generic.List<string> r = new System.Collections.Generic.List<string>();
	foreach (string k in nv)
		r.Add(string.Format("{0}={1}", System.Web.HttpUtility.UrlEncode(k), System.Web.HttpUtility.UrlEncode(nv[k])));
	return string.Join("&", r.ToArray());
}

private string SetQueryStringParam(string key, string value) {
	System.Collections.Specialized.NameValueCollection nv = new System.Collections.Specialized.NameValueCollection(Request.QueryString);
	nv[key] = value;
	return Request.RawUrl.Split('?')[0] + "?" + ToQueryString(nv);
}

public void Page_Load() {
	Response.Cache.SetExpires(DateTime.Now.Add(cacheDuration));
	System.Web.UI.HtmlControls.HtmlGenericControl container = (System.Web.UI.HtmlControls.HtmlGenericControl)FindControl("servercontent");
	int page = Convert.ToInt32(Request.QueryString["page"]);
	System.Xml.XmlDocument feed = Fetch(UrlFetch(page*pageSize));
	System.Xml.XmlNodeList items = feed.SelectNodes("rss/channel/item");
	if (items.Count == 0) {
		Response.Status = "404 Not Found";
	}
		
	StringBuilder sb = new StringBuilder();
	foreach (System.Xml.XmlNode item in items) {
		sb.Append("<h1 style='margin: 0'>");
		string guidLink = item.SelectSingleNode("guid").InnerText;
		sb.AppendFormat("<a href=\"{0}\">", IsUrl(guidLink) ? guidLink : item.SelectSingleNode("link").InnerText);
		sb.Append(item.SelectSingleNode("title").InnerText);
		sb.Append("</a>");
		sb.Append("</h1>");
		
		sb.Append("<p style='color: #777; font-size: 75%'>");
		sb.AppendFormat("Posted {0}", DateTime.Parse(item.SelectSingleNode("pubDate").InnerText));
		sb.Append("</p>");
		
		sb.Append("<p>");
		sb.Append(item.SelectSingleNode("description").InnerText);
		sb.Append("</p>");				
	}
	
	sb.Append("<p>");
	sb.AppendFormat("<a href=\"{0}\">", SetQueryStringParam("page", (page+1).ToString()));
	sb.Append("Older entries");
	sb.Append("</a>");
	sb.Append("</p>");
	
	container.InnerHtml = sb.ToString();
}