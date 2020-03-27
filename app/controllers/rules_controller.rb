class RulesController < AuthenticatedController
  def index
    @rules = shop.rules
  end

  def new
    @rule = shop.rules.build
  end

  def show
    @rule = shop.rules.find(params[:id])
  end

  def create
    @rule = shop.rules.build(rule_params)

    if @rule.save
      sync_webhooks
      redirect_to(rules_path, flash: { notice: "Rule created successfully." })
    else
      render('new')
    end
  end

  def update
    @rule = shop.rules.find(params[:id])

    if @rule.update_attributes(rule_params)
      sync_webhooks
      redirect_to(rule_path(@rule), flash: { notice: "Rule updated successfully." })
    else
      render('show')
    end
  end

  def destroy
    @rule = shop.rules.find(params[:id])

    if @rule.destroy
      sync_webhooks
      redirect_to(rules_path, flash: { notice: "Rule deleted successfully." })
    else
      render('show')
    end
  end

  private

  def rule_params
    params
      .require(:rule)
      .permit(
        :name,
        :topic,
        filters_attributes: [:id, :value, :verb, :regex, :_destroy],
        handlers_attributes: [:id, :service_name, :_destroy, settings: {}],
      )
  end

  def sync_webhooks
    SyncWebhookJob.perform_later(shop_domain: shop.shopify_domain)
  end
end
